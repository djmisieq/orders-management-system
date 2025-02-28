using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using OrdersManagement.Backend.Models;

namespace OrdersManagement.Backend.Data.Repositories
{
    public class ProductionTaskRepository : IProductionTaskRepository
    {
        private readonly ApplicationDbContext _context;
        
        public ProductionTaskRepository(ApplicationDbContext context)
        {
            _context = context;
        }
        
        public async Task<IEnumerable<ProductionTask>> GetAllTasksAsync()
        {
            return await _context.ProductionTasks
                .Include(t => t.Order)
                .OrderByDescending(t => t.PlannedStartTime)
                .ToListAsync();
        }
        
        public async Task<ProductionTask> GetTaskByIdAsync(int id)
        {
            return await _context.ProductionTasks
                .Include(t => t.Order)
                .FirstOrDefaultAsync(t => t.Id == id);
        }
        
        public async Task<IEnumerable<ProductionTask>> GetTasksByOrderIdAsync(int orderId)
        {
            return await _context.ProductionTasks
                .Where(t => t.OrderId == orderId)
                .OrderBy(t => t.PlannedStartTime)
                .ToListAsync();
        }
        
        public async Task<IEnumerable<ProductionTask>> GetTasksByStatusAsync(string status)
        {
            return await _context.ProductionTasks
                .Include(t => t.Order)
                .Where(t => t.Status == status)
                .OrderBy(t => t.PlannedStartTime)
                .ToListAsync();
        }
        
        public async Task<IEnumerable<ProductionTask>> GetTasksByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            return await _context.ProductionTasks
                .Include(t => t.Order)
                .Where(t => 
                    (t.PlannedStartTime >= startDate && t.PlannedStartTime <= endDate) ||
                    (t.PlannedEndTime >= startDate && t.PlannedEndTime <= endDate) ||
                    (t.PlannedStartTime <= startDate && t.PlannedEndTime >= endDate)
                )
                .OrderBy(t => t.PlannedStartTime)
                .ToListAsync();
        }
        
        public async Task<IEnumerable<ProductionTask>> GetTasksByResourceIdAsync(int resourceId)
        {
            var taskIds = await _context.TaskResourceAssignments
                .Where(tra => tra.ResourceId == resourceId)
                .Select(tra => tra.TaskId)
                .Distinct()
                .ToListAsync();
            
            return await _context.ProductionTasks
                .Include(t => t.Order)
                .Where(t => taskIds.Contains(t.Id))
                .OrderBy(t => t.PlannedStartTime)
                .ToListAsync();
        }
        
        public async Task<ProductionTask> CreateTaskAsync(ProductionTask task)
        {
            // Ensure timestamps are set
            task.CreatedAt = DateTime.UtcNow;
            if (task.UpdatedAt == null)
            {
                task.UpdatedAt = DateTime.UtcNow;
            }
            
            _context.ProductionTasks.Add(task);
            await _context.SaveChangesAsync();
            return task;
        }
        
        public async Task<ProductionTask> UpdateTaskAsync(ProductionTask task)
        {
            // Update the timestamp
            task.UpdatedAt = DateTime.UtcNow;
            
            _context.Entry(task).State = EntityState.Modified;
            
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await TaskExistsAsync(task.Id))
                {
                    return null;
                }
                throw;
            }
            
            return task;
        }
        
        public async Task<bool> DeleteTaskAsync(int id)
        {
            var task = await _context.ProductionTasks.FindAsync(id);
            if (task == null)
            {
                return false;
            }
            
            // Delete related resource assignments
            var assignments = await _context.TaskResourceAssignments
                .Where(tra => tra.TaskId == id)
                .ToListAsync();
            
            _context.TaskResourceAssignments.RemoveRange(assignments);
            
            // Delete the task
            _context.ProductionTasks.Remove(task);
            await _context.SaveChangesAsync();
            
            return true;
        }
        
        public async Task<bool> TaskExistsAsync(int id)
        {
            return await _context.ProductionTasks.AnyAsync(t => t.Id == id);
        }
        
        public async Task<bool> UpdateTaskStatusAsync(int id, string status, int completionPercentage, int userId, string userName)
        {
            var task = await _context.ProductionTasks.FindAsync(id);
            if (task == null)
            {
                return false;
            }
            
            // Update status and completion
            string oldStatus = task.Status;
            task.Status = status;
            task.CompletionPercentage = completionPercentage;
            task.UpdatedAt = DateTime.UtcNow;
            task.UpdatedById = userId;
            task.UpdatedByName = userName;
            
            // If status changed to "InProgress" and no actual start time, set it
            if (status == "InProgress" && task.ActualStartTime == null)
            {
                task.ActualStartTime = DateTime.UtcNow;
            }
            
            // If status changed to "Completed" and no actual end time, set it
            if (status == "Completed" && task.ActualEndTime == null)
            {
                task.ActualEndTime = DateTime.UtcNow;
                
                // Calculate actual duration in minutes
                if (task.ActualStartTime.HasValue)
                {
                    var duration = (int)Math.Round((task.ActualEndTime.Value - task.ActualStartTime.Value).TotalMinutes);
                    task.ActualDuration = duration;
                }
                
                // Ensure completion is 100%
                task.CompletionPercentage = 100;
            }
            
            await _context.SaveChangesAsync();
            return true;
        }
        
        public async Task<bool> AssignResourceToTaskAsync(int taskId, int resourceId, DateTime startTime, DateTime endTime, decimal allocationPercentage, int userId, string userName)
        {
            // Check if task and resource exist
            var task = await _context.ProductionTasks.FindAsync(taskId);
            var resource = await _context.Resources.FindAsync(resourceId);
            
            if (task == null || resource == null)
            {
                return false;
            }
            
            // Check for existing assignment
            var existingAssignment = await _context.TaskResourceAssignments
                .FirstOrDefaultAsync(tra => tra.TaskId == taskId && tra.ResourceId == resourceId);
                
            if (existingAssignment != null)
            {
                // Update existing assignment
                existingAssignment.StartTime = startTime;
                existingAssignment.EndTime = endTime;
                existingAssignment.AllocationPercentage = allocationPercentage;
            }
            else
            {
                // Create new assignment
                var assignment = new TaskResourceAssignment
                {
                    TaskId = taskId,
                    ResourceId = resourceId,
                    StartTime = startTime,
                    EndTime = endTime,
                    AllocationPercentage = allocationPercentage,
                    CreatedAt = DateTime.UtcNow,
                    CreatedById = userId,
                    CreatedByName = userName
                };
                
                _context.TaskResourceAssignments.Add(assignment);
            }
            
            await _context.SaveChangesAsync();
            return true;
        }
        
        public async Task<bool> RemoveResourceFromTaskAsync(int taskId, int resourceId)
        {
            var assignment = await _context.TaskResourceAssignments
                .FirstOrDefaultAsync(tra => tra.TaskId == taskId && tra.ResourceId == resourceId);
                
            if (assignment == null)
            {
                return false;
            }
            
            _context.TaskResourceAssignments.Remove(assignment);
            await _context.SaveChangesAsync();
            
            return true;
        }
    }
}
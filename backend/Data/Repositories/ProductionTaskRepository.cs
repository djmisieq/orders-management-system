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
                .Where(t => t.Status == status)
                .Include(t => t.Order)
                .OrderBy(t => t.PlannedStartTime)
                .ToListAsync();
        }
        
        public async Task<IEnumerable<ProductionTask>> GetTasksForPeriodAsync(DateTime startDate, DateTime endDate)
        {
            return await _context.ProductionTasks
                .Where(t => 
                    (t.PlannedStartTime <= endDate && t.PlannedEndTime >= startDate) ||
                    (t.ActualStartTime <= endDate && t.ActualEndTime >= startDate)
                )
                .Include(t => t.Order)
                .OrderBy(t => t.PlannedStartTime)
                .ToListAsync();
        }
        
        public async Task<IEnumerable<ProductionTask>> GetTasksByResourceIdAsync(int resourceId)
        {
            // Get all task IDs that have the specified resource assigned
            var taskIds = await _context.TaskResourceAssignments
                .Where(a => a.ResourceId == resourceId)
                .Select(a => a.TaskId)
                .Distinct()
                .ToListAsync();
            
            // Get the tasks
            return await _context.ProductionTasks
                .Where(t => taskIds.Contains(t.Id))
                .Include(t => t.Order)
                .OrderBy(t => t.PlannedStartTime)
                .ToListAsync();
        }
        
        public async Task<ProductionTask> CreateTaskAsync(ProductionTask task)
        {
            task.CreatedAt = DateTime.UtcNow;
            
            _context.ProductionTasks.Add(task);
            await _context.SaveChangesAsync();
            return task;
        }
        
        public async Task<ProductionTask> UpdateTaskAsync(ProductionTask task)
        {
            task.UpdatedAt = DateTime.UtcNow;
            
            _context.Entry(task).State = EntityState.Modified;
            // Don't modify CreatedAt and CreatedBy fields
            _context.Entry(task).Property(t => t.CreatedAt).IsModified = false;
            _context.Entry(task).Property(t => t.CreatedById).IsModified = false;
            _context.Entry(task).Property(t => t.CreatedByName).IsModified = false;
            
            try
            {
                await _context.SaveChangesAsync();
                return task;
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await TaskExistsAsync(task.Id))
                {
                    return null;
                }
                throw;
            }
        }
        
        public async Task<bool> DeleteTaskAsync(int id)
        {
            var task = await _context.ProductionTasks.FindAsync(id);
            if (task == null)
            {
                return false;
            }
            
            // Delete associated resource assignments
            var assignments = await _context.TaskResourceAssignments
                .Where(a => a.TaskId == id)
                .ToListAsync();
                
            _context.TaskResourceAssignments.RemoveRange(assignments);
            
            // Delete the task
            _context.ProductionTasks.Remove(task);
            await _context.SaveChangesAsync();
            return true;
        }
        
        public async Task<IEnumerable<TaskResourceAssignment>> GetTaskResourceAssignmentsAsync(int taskId)
        {
            return await _context.TaskResourceAssignments
                .Where(a => a.TaskId == taskId)
                .Include(a => a.Resource)
                .ToListAsync();
        }
        
        public async Task<TaskResourceAssignment> AssignResourceToTaskAsync(TaskResourceAssignment assignment)
        {
            assignment.CreatedAt = DateTime.UtcNow;
            
            _context.TaskResourceAssignments.Add(assignment);
            await _context.SaveChangesAsync();
            return assignment;
        }
        
        public async Task<bool> RemoveResourceFromTaskAsync(int assignmentId)
        {
            var assignment = await _context.TaskResourceAssignments.FindAsync(assignmentId);
            if (assignment == null)
            {
                return false;
            }
            
            _context.TaskResourceAssignments.Remove(assignment);
            await _context.SaveChangesAsync();
            return true;
        }
        
        public async Task<IEnumerable<ProductionTask>> GetDependentTasksAsync(int taskId)
        {
            var task = await _context.ProductionTasks.FindAsync(taskId);
            if (task == null)
            {
                return new List<ProductionTask>();
            }
            
            // Find all tasks that have this task as a predecessor
            return await _context.ProductionTasks
                .Where(t => t.PredecessorTaskIds != null && t.PredecessorTaskIds.Contains(taskId.ToString()))
                .ToListAsync();
        }
        
        public async Task<bool> UpdateTaskStatusAsync(int taskId, string newStatus, int userId, string userName)
        {
            var task = await _context.ProductionTasks.FindAsync(taskId);
            if (task == null)
            {
                return false;
            }
            
            string oldStatus = task.Status;
            task.Status = newStatus;
            task.UpdatedAt = DateTime.UtcNow;
            task.UpdatedById = userId;
            task.UpdatedByName = userName;
            
            // Update actual start/end time based on status
            if (newStatus == "In Progress" && task.ActualStartTime == null)
            {
                task.ActualStartTime = DateTime.UtcNow;
            }
            else if ((newStatus == "Completed" || newStatus == "Cancelled") && task.ActualEndTime == null)
            {
                task.ActualEndTime = DateTime.UtcNow;
                
                if (newStatus == "Completed")
                {
                    task.CompletionPercentage = 100;
                }
            }
            
            await _context.SaveChangesAsync();
            return true;
        }
        
        public async Task<bool> UpdateTaskProgressAsync(int taskId, int completionPercentage, int userId, string userName)
        {
            var task = await _context.ProductionTasks.FindAsync(taskId);
            if (task == null)
            {
                return false;
            }
            
            // Validate completion percentage
            if (completionPercentage < 0 || completionPercentage > 100)
            {
                return false;
            }
            
            task.CompletionPercentage = completionPercentage;
            task.UpdatedAt = DateTime.UtcNow;
            task.UpdatedById = userId;
            task.UpdatedByName = userName;
            
            // If completion is 100%, update status to Completed if not already
            if (completionPercentage == 100 && task.Status != "Completed")
            {
                task.Status = "Completed";
                task.ActualEndTime = DateTime.UtcNow;
            }
            
            await _context.SaveChangesAsync();
            return true;
        }
        
        private async Task<bool> TaskExistsAsync(int id)
        {
            return await _context.ProductionTasks.AnyAsync(t => t.Id == id);
        }
    }
}
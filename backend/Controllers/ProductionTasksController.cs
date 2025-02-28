using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OrdersManagement.Backend.Data;
using OrdersManagement.Backend.Models;

namespace OrdersManagement.Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductionTasksController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ProductionTasksController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/ProductionTasks
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProductionTask>>> GetProductionTasks(
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null,
            [FromQuery] string status = null,
            [FromQuery] int? orderId = null)
        {
            var query = _context.ProductionTasks.AsQueryable();
            
            // Apply filters if provided
            if (startDate.HasValue)
            {
                query = query.Where(t => 
                    t.PlannedStartTime >= startDate.Value || 
                    t.PlannedEndTime >= startDate.Value);
            }
            
            if (endDate.HasValue)
            {
                query = query.Where(t => 
                    t.PlannedStartTime <= endDate.Value || 
                    t.PlannedEndTime <= endDate.Value);
            }
            
            if (!string.IsNullOrWhiteSpace(status))
            {
                query = query.Where(t => t.Status == status);
            }
            
            if (orderId.HasValue)
            {
                query = query.Where(t => t.OrderId == orderId.Value);
            }
            
            return await query
                .Include(t => t.Order)
                .OrderBy(t => t.PlannedStartTime)
                .ToListAsync();
        }

        // GET: api/ProductionTasks/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ProductionTask>> GetProductionTask(int id)
        {
            var productionTask = await _context.ProductionTasks
                .Include(t => t.Order)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (productionTask == null)
            {
                return NotFound();
            }

            // Get assigned resources
            var resourceAssignments = await _context.TaskResourceAssignments
                .Include(tra => tra.Resource)
                .Where(tra => tra.TaskId == id)
                .ToListAsync();
                
            // Convert to a response DTO with more information
            var response = new ProductionTaskDetailDto
            {
                Task = productionTask,
                ResourceAssignments = resourceAssignments
            };

            return Ok(response);
        }
        
        // GET: api/ProductionTasks/order/5
        [HttpGet("order/{orderId}")]
        public async Task<ActionResult<IEnumerable<ProductionTask>>> GetTasksByOrder(int orderId)
        {
            var order = await _context.Orders.FindAsync(orderId);
            if (order == null)
            {
                return NotFound("Order not found");
            }
            
            return await _context.ProductionTasks
                .Where(t => t.OrderId == orderId)
                .OrderBy(t => t.PlannedStartTime)
                .ToListAsync();
        }
        
        // GET: api/ProductionTasks/calendar
        [HttpGet("calendar")]
        public async Task<ActionResult<IEnumerable<CalendarTaskDto>>> GetTasksForCalendar(
            [FromQuery] DateTime startDate,
            [FromQuery] DateTime endDate)
        {
            var tasks = await _context.ProductionTasks
                .Include(t => t.Order)
                .Where(t => 
                    (t.PlannedStartTime >= startDate && t.PlannedStartTime <= endDate) ||
                    (t.PlannedEndTime >= startDate && t.PlannedEndTime <= endDate) ||
                    (t.PlannedStartTime <= startDate && t.PlannedEndTime >= endDate))
                .ToListAsync();
                
            var calendarTasks = tasks.Select(t => new CalendarTaskDto
            {
                Id = t.Id,
                Title = t.Title,
                OrderId = t.OrderId,
                OrderName = t.Order.CustomerName,
                Start = t.PlannedStartTime,
                End = t.PlannedEndTime,
                Status = t.Status,
                Progress = t.CompletionPercentage,
                Color = GetColorForTaskStatus(t.Status),
                ResourceIds = GetResourceIdsForTask(t.Id).Result
            }).ToList();
            
            return calendarTasks;
        }

        // PUT: api/ProductionTasks/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutProductionTask(int id, ProductionTask productionTask)
        {
            if (id != productionTask.Id)
            {
                return BadRequest();
            }

            _context.Entry(productionTask).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ProductionTaskExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/ProductionTasks
        [HttpPost]
        public async Task<ActionResult<ProductionTask>> PostProductionTask(ProductionTask productionTask)
        {
            // Validate that the order exists
            var order = await _context.Orders.FindAsync(productionTask.OrderId);
            if (order == null)
            {
                return BadRequest("Invalid order ID");
            }
            
            // Set creation metadata
            productionTask.CreatedAt = DateTime.UtcNow;
            
            _context.ProductionTasks.Add(productionTask);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetProductionTask", new { id = productionTask.Id }, productionTask);
        }

        // POST: api/ProductionTasks/reschedule
        [HttpPost("reschedule")]
        public async Task<IActionResult> RescheduleTask(RescheduleTaskDto rescheduleData)
        {
            var task = await _context.ProductionTasks.FindAsync(rescheduleData.TaskId);
            if (task == null)
            {
                return NotFound("Task not found");
            }
            
            // Calculate how much the date has changed
            var timeDiff = rescheduleData.NewStartDate - task.PlannedStartTime;
            
            // Update planned dates
            task.PlannedStartTime = rescheduleData.NewStartDate;
            task.PlannedEndTime = task.PlannedEndTime.Add(timeDiff);
            
            // Update change tracking info
            task.UpdatedAt = DateTime.UtcNow;
            task.UpdatedById = rescheduleData.UserId;
            task.UpdatedByName = rescheduleData.UserName;
            
            // Update any resource assignments
            var assignments = await _context.TaskResourceAssignments
                .Where(tra => tra.TaskId == task.Id)
                .ToListAsync();
                
            foreach (var assignment in assignments)
            {
                assignment.StartTime = assignment.StartTime.Add(timeDiff);
                assignment.EndTime = assignment.EndTime.Add(timeDiff);
            }
            
            await _context.SaveChangesAsync();
            
            // Check for scheduling conflicts
            var conflicts = await DetectConflicts(task.Id);
            
            return Ok(new { 
                Success = true, 
                Task = task,
                HasConflicts = conflicts.Any(),
                Conflicts = conflicts
            });
        }
        
        // POST: api/ProductionTasks/assign-resource
        [HttpPost("assign-resource")]
        public async Task<ActionResult<TaskResourceAssignment>> AssignResource(AssignResourceDto assignData)
        {
            // Validate task exists
            var task = await _context.ProductionTasks.FindAsync(assignData.TaskId);
            if (task == null)
            {
                return NotFound("Task not found");
            }
            
            // Validate resource exists
            var resource = await _context.Resources.FindAsync(assignData.ResourceId);
            if (resource == null)
            {
                return NotFound("Resource not found");
            }
            
            // Check if already assigned
            var existingAssignment = await _context.TaskResourceAssignments
                .FirstOrDefaultAsync(tra => 
                    tra.TaskId == assignData.TaskId && 
                    tra.ResourceId == assignData.ResourceId);
                    
            if (existingAssignment != null)
            {
                // Update existing assignment
                existingAssignment.StartTime = assignData.StartTime;
                existingAssignment.EndTime = assignData.EndTime;
                existingAssignment.AllocationPercentage = assignData.AllocationPercentage;
                existingAssignment.Notes = assignData.Notes;
            }
            else
            {
                // Create new assignment
                var assignment = new TaskResourceAssignment
                {
                    TaskId = assignData.TaskId,
                    ResourceId = assignData.ResourceId,
                    StartTime = assignData.StartTime,
                    EndTime = assignData.EndTime,
                    AllocationPercentage = assignData.AllocationPercentage,
                    Notes = assignData.Notes,
                    CreatedAt = DateTime.UtcNow,
                    CreatedById = assignData.UserId,
                    CreatedByName = assignData.UserName
                };
                
                _context.TaskResourceAssignments.Add(assignment);
            }
            
            await _context.SaveChangesAsync();
            
            // Check for scheduling conflicts
            var conflicts = await DetectConflicts(assignData.TaskId);
            
            return Ok(new { 
                Success = true,
                HasConflicts = conflicts.Any(),
                Conflicts = conflicts
            });
        }
        
        // DELETE: api/ProductionTasks/unassign-resource/5/2
        [HttpDelete("unassign-resource/{taskId}/{resourceId}")]
        public async Task<IActionResult> UnassignResource(int taskId, int resourceId)
        {
            var assignment = await _context.TaskResourceAssignments
                .FirstOrDefaultAsync(tra => 
                    tra.TaskId == taskId && 
                    tra.ResourceId == resourceId);
                    
            if (assignment == null)
            {
                return NotFound("Assignment not found");
            }
            
            _context.TaskResourceAssignments.Remove(assignment);
            await _context.SaveChangesAsync();
            
            return NoContent();
        }

        // DELETE: api/ProductionTasks/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProductionTask(int id)
        {
            var productionTask = await _context.ProductionTasks.FindAsync(id);
            if (productionTask == null)
            {
                return NotFound();
            }
            
            // Remove any resource assignments
            var assignments = await _context.TaskResourceAssignments
                .Where(tra => tra.TaskId == id)
                .ToListAsync();
                
            _context.TaskResourceAssignments.RemoveRange(assignments);

            _context.ProductionTasks.Remove(productionTask);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        
        // Helper methods
        private async Task<List<int>> GetResourceIdsForTask(int taskId)
        {
            return await _context.TaskResourceAssignments
                .Where(tra => tra.TaskId == taskId)
                .Select(tra => tra.ResourceId)
                .ToListAsync();
        }
        
        private string GetColorForTaskStatus(string status)
        {
            return status switch
            {
                "Planned" => "#3498db",      // Blue
                "InProgress" => "#f39c12",   // Orange
                "Completed" => "#2ecc71",    // Green
                "OnHold" => "#95a5a6",       // Gray
                "Cancelled" => "#e74c3c",    // Red
                _ => "#3498db"               // Default blue
            };
        }
        
        private async Task<List<ConflictDto>> DetectConflicts(int taskId)
        {
            var conflicts = new List<ConflictDto>();
            
            // Get the task and its resource assignments
            var task = await _context.ProductionTasks.FindAsync(taskId);
            if (task == null) return conflicts;
            
            var taskAssignments = await _context.TaskResourceAssignments
                .Where(tra => tra.TaskId == taskId)
                .ToListAsync();
                
            foreach (var assignment in taskAssignments)
            {
                // Find overlapping assignments for the same resource
                var overlappingAssignments = await _context.TaskResourceAssignments
                    .Include(tra => tra.Task)
                    .Where(tra => 
                        tra.TaskId != taskId && 
                        tra.ResourceId == assignment.ResourceId &&
                        ((tra.StartTime >= assignment.StartTime && tra.StartTime < assignment.EndTime) ||
                         (tra.EndTime > assignment.StartTime && tra.EndTime <= assignment.EndTime) ||
                         (tra.StartTime <= assignment.StartTime && tra.EndTime >= assignment.EndTime)))
                    .ToListAsync();
                    
                // Add conflicts to the list
                foreach (var overlap in overlappingAssignments)
                {
                    // Check if total allocation exceeds 100%
                    decimal totalAllocation = assignment.AllocationPercentage + overlap.AllocationPercentage;
                    
                    if (totalAllocation > 100)
                    {
                        conflicts.Add(new ConflictDto
                        {
                            ResourceId = assignment.ResourceId,
                            ResourceName = (await _context.Resources.FindAsync(assignment.ResourceId))?.Name,
                            TaskId = taskId,
                            ConflictingTaskId = overlap.TaskId,
                            ConflictingTaskTitle = overlap.Task.Title,
                            StartTime = (overlap.StartTime > assignment.StartTime) ? 
                                overlap.StartTime : assignment.StartTime,
                            EndTime = (overlap.EndTime < assignment.EndTime) ? 
                                overlap.EndTime : assignment.EndTime,
                            TotalAllocation = totalAllocation
                        });
                    }
                }
            }
            
            return conflicts;
        }

        private bool ProductionTaskExists(int id)
        {
            return _context.ProductionTasks.Any(e => e.Id == id);
        }
    }
    
    // DTOs for the controller
    public class ProductionTaskDetailDto
    {
        public ProductionTask Task { get; set; }
        public List<TaskResourceAssignment> ResourceAssignments { get; set; }
    }
    
    public class CalendarTaskDto
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public int OrderId { get; set; }
        public string OrderName { get; set; }
        public DateTime Start { get; set; }
        public DateTime End { get; set; }
        public string Status { get; set; }
        public int Progress { get; set; }
        public string Color { get; set; }
        public List<int> ResourceIds { get; set; }
    }
    
    public class RescheduleTaskDto
    {
        public int TaskId { get; set; }
        public DateTime NewStartDate { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; }
    }
    
    public class AssignResourceDto
    {
        public int TaskId { get; set; }
        public int ResourceId { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public decimal AllocationPercentage { get; set; }
        public string Notes { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; }
    }
    
    public class ConflictDto
    {
        public int ResourceId { get; set; }
        public string ResourceName { get; set; }
        public int TaskId { get; set; }
        public int ConflictingTaskId { get; set; }
        public string ConflictingTaskTitle { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public decimal TotalAllocation { get; set; }
    }
}

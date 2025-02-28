using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using OrdersManagement.Backend.Models;

namespace OrdersManagement.Backend.Data.Repositories
{
    public interface IProductionTaskRepository
    {
        // Basic CRUD operations
        Task<IEnumerable<ProductionTask>> GetAllTasksAsync();
        Task<ProductionTask> GetTaskByIdAsync(int id);
        Task<ProductionTask> CreateTaskAsync(ProductionTask task);
        Task<ProductionTask> UpdateTaskAsync(ProductionTask task);
        Task<bool> DeleteTaskAsync(int id);
        
        // Specialized queries
        Task<IEnumerable<ProductionTask>> GetTasksByOrderIdAsync(int orderId);
        Task<IEnumerable<ProductionTask>> GetTasksByDateRangeAsync(DateTime startDate, DateTime endDate);
        Task<IEnumerable<ProductionTask>> GetTasksByStatusAsync(string status);
        Task<IEnumerable<ProductionTask>> GetPendingTasksAsync();
        
        // Resource assignment operations
        Task<bool> AssignResourceToTaskAsync(int taskId, int resourceId, DateTime startTime, DateTime endTime, decimal allocationPercentage = 100);
        Task<bool> UnassignResourceFromTaskAsync(int taskId, int resourceId);
        Task<IEnumerable<Resource>> GetResourcesAssignedToTaskAsync(int taskId);
        
        // Advanced scheduling operations
        Task<Dictionary<int, List<TimeSlot>>> GetResourceAvailabilityAsync(IEnumerable<int> resourceIds, DateTime startDate, DateTime endDate);
        Task<IEnumerable<ScheduleConflict>> DetectScheduleConflictsAsync(DateTime startDate, DateTime endDate);
        Task<bool> RescheduleTaskAsync(int taskId, DateTime newStartTime, DateTime newEndTime);
    }
    
    // Helper classes for scheduling operations
    public class TimeSlot
    {
        public DateTime Start { get; set; }
        public DateTime End { get; set; }
        public bool IsAvailable { get; set; }
    }
    
    public class ScheduleConflict
    {
        public int ResourceId { get; set; }
        public string ResourceName { get; set; }
        public DateTime ConflictStart { get; set; }
        public DateTime ConflictEnd { get; set; }
        public List<ProductionTask> ConflictingTasks { get; set; }
    }
}
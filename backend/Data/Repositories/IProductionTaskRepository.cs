using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using OrdersManagement.Backend.Models;

namespace OrdersManagement.Backend.Data.Repositories
{
    public interface IProductionTaskRepository
    {
        Task<IEnumerable<ProductionTask>> GetAllTasksAsync();
        Task<ProductionTask> GetTaskByIdAsync(int id);
        Task<IEnumerable<ProductionTask>> GetTasksByOrderIdAsync(int orderId);
        Task<IEnumerable<ProductionTask>> GetTasksByStatusAsync(string status);
        Task<IEnumerable<ProductionTask>> GetTasksByDateRangeAsync(DateTime startDate, DateTime endDate);
        Task<IEnumerable<ProductionTask>> GetTasksByResourceIdAsync(int resourceId);
        Task<ProductionTask> CreateTaskAsync(ProductionTask task);
        Task<ProductionTask> UpdateTaskAsync(ProductionTask task);
        Task<bool> DeleteTaskAsync(int id);
        Task<bool> TaskExistsAsync(int id);
        Task<bool> UpdateTaskStatusAsync(int id, string status, int completionPercentage, int userId, string userName);
        Task<bool> AssignResourceToTaskAsync(int taskId, int resourceId, DateTime startTime, DateTime endTime, decimal allocationPercentage, int userId, string userName);
        Task<bool> RemoveResourceFromTaskAsync(int taskId, int resourceId);
    }
}
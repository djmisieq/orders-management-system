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
        Task<IEnumerable<ProductionTask>> GetTasksByDateRangeAsync(DateTime start, DateTime end);
        Task<IEnumerable<ProductionTask>> GetTasksByResourceIdAsync(int resourceId);
        Task<ProductionTask> CreateTaskAsync(ProductionTask task);
        Task<ProductionTask> UpdateTaskAsync(ProductionTask task);
        Task<bool> DeleteTaskAsync(int id);
        Task<bool> TaskExistsAsync(int id);
        Task<ProductionTask> UpdateTaskStatusAsync(int id, string status, int? userId = null, string userName = null);
        Task<ProductionTask> UpdateTaskProgressAsync(int id, int completionPercentage, int? userId = null, string userName = null);
    }
}
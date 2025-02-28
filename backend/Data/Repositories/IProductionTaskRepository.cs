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
        Task<IEnumerable<ProductionTask>> GetTasksForPeriodAsync(DateTime startDate, DateTime endDate);
        Task<IEnumerable<ProductionTask>> GetTasksByResourceIdAsync(int resourceId);
        Task<ProductionTask> CreateTaskAsync(ProductionTask task);
        Task<ProductionTask> UpdateTaskAsync(ProductionTask task);
        Task<bool> DeleteTaskAsync(int id);
        Task<IEnumerable<TaskResourceAssignment>> GetTaskResourceAssignmentsAsync(int taskId);
        Task<TaskResourceAssignment> AssignResourceToTaskAsync(TaskResourceAssignment assignment);
        Task<bool> RemoveResourceFromTaskAsync(int assignmentId);
        Task<IEnumerable<ProductionTask>> GetDependentTasksAsync(int taskId);
        Task<bool> UpdateTaskStatusAsync(int taskId, string newStatus, int userId, string userName);
        Task<bool> UpdateTaskProgressAsync(int taskId, int completionPercentage, int userId, string userName);
    }
}
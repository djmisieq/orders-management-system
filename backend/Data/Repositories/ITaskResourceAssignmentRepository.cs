using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using OrdersManagement.Backend.Models;

namespace OrdersManagement.Backend.Data.Repositories
{
    public interface ITaskResourceAssignmentRepository
    {
        Task<IEnumerable<TaskResourceAssignment>> GetAllAssignmentsAsync();
        Task<TaskResourceAssignment> GetAssignmentByIdAsync(int id);
        Task<IEnumerable<TaskResourceAssignment>> GetAssignmentsByTaskIdAsync(int taskId);
        Task<IEnumerable<TaskResourceAssignment>> GetAssignmentsByResourceIdAsync(int resourceId);
        Task<IEnumerable<TaskResourceAssignment>> GetAssignmentsByDateRangeAsync(DateTime start, DateTime end);
        Task<IEnumerable<TaskResourceAssignment>> GetConflictingAssignmentsAsync(int resourceId, DateTime start, DateTime end, int? excludeTaskId = null);
        Task<TaskResourceAssignment> CreateAssignmentAsync(TaskResourceAssignment assignment);
        Task<TaskResourceAssignment> UpdateAssignmentAsync(TaskResourceAssignment assignment);
        Task<bool> DeleteAssignmentAsync(int id);
        Task<bool> AssignmentExistsAsync(int id);
    }
}
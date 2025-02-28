using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using OrdersManagement.Backend.Models;

namespace OrdersManagement.Backend.Data.Repositories
{
    public interface IResourceRepository
    {
        // Basic CRUD operations
        Task<IEnumerable<Resource>> GetAllResourcesAsync();
        Task<Resource> GetResourceByIdAsync(int id);
        Task<Resource> CreateResourceAsync(Resource resource);
        Task<Resource> UpdateResourceAsync(Resource resource);
        Task<bool> DeleteResourceAsync(int id);
        
        // Advanced queries
        Task<IEnumerable<Resource>> GetResourcesByTypeAsync(string resourceType);
        Task<IEnumerable<Resource>> GetResourcesByDepartmentAsync(string department);
        Task<IEnumerable<Resource>> GetAvailableResourcesAsync(DateTime startTime, DateTime endTime);
        Task<bool> IsResourceAvailableAsync(int resourceId, DateTime startTime, DateTime endTime);
        
        // Load-related operations
        Task<IDictionary<DateTime, decimal>> GetResourceLoadAsync(int resourceId, DateTime startDate, DateTime endDate);
        Task<IEnumerable<ProductionTask>> GetTasksForResourceAsync(int resourceId, DateTime startDate, DateTime endDate);
    }
}
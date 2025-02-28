using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using OrdersManagement.Backend.Models;

namespace OrdersManagement.Backend.Data.Repositories
{
    public interface IResourceRepository
    {
        Task<IEnumerable<Resource>> GetAllResourcesAsync();
        Task<Resource> GetResourceByIdAsync(int id);
        Task<IEnumerable<Resource>> GetResourcesByTypeAsync(string resourceType);
        Task<IEnumerable<Resource>> GetResourcesByDepartmentAsync(string department);
        Task<IEnumerable<Resource>> GetAvailableResourcesForPeriodAsync(DateTime start, DateTime end);
        Task<Resource> CreateResourceAsync(Resource resource);
        Task<Resource> UpdateResourceAsync(Resource resource);
        Task<bool> DeleteResourceAsync(int id);
        Task<bool> ResourceExistsAsync(int id);
    }
}
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using OrdersManagement.Backend.Models;

namespace OrdersManagement.Backend.Data.Repositories
{
    public class ResourceRepository : IResourceRepository
    {
        private readonly ApplicationDbContext _context;
        
        public ResourceRepository(ApplicationDbContext context)
        {
            _context = context;
        }
        
        public async Task<IEnumerable<Resource>> GetAllResourcesAsync()
        {
            return await _context.Resources.ToListAsync();
        }
        
        public async Task<Resource> GetResourceByIdAsync(int id)
        {
            return await _context.Resources.FindAsync(id);
        }
        
        public async Task<IEnumerable<Resource>> GetResourcesByTypeAsync(string resourceType)
        {
            return await _context.Resources
                .Where(r => r.ResourceType == resourceType)
                .ToListAsync();
        }
        
        public async Task<IEnumerable<Resource>> GetResourcesByDepartmentAsync(string department)
        {
            return await _context.Resources
                .Where(r => r.Department == department)
                .ToListAsync();
        }
        
        public async Task<IEnumerable<Resource>> GetAvailableResourcesForPeriodAsync(DateTime startTime, DateTime endTime)
        {
            // Get all resources
            var allResources = await _context.Resources
                .Where(r => r.IsActive)
                .ToListAsync();
            
            // Get resources that are already assigned during the specified time period
            var assignedResourceIds = await _context.TaskResourceAssignments
                .Where(a => 
                    (a.StartTime <= endTime && a.EndTime >= startTime)
                )
                .Select(a => a.ResourceId)
                .Distinct()
                .ToListAsync();
            
            // Filter out assigned resources
            return allResources.Where(r => !assignedResourceIds.Contains(r.Id));
        }
        
        public async Task<Resource> CreateResourceAsync(Resource resource)
        {
            _context.Resources.Add(resource);
            await _context.SaveChangesAsync();
            return resource;
        }
        
        public async Task<Resource> UpdateResourceAsync(Resource resource)
        {
            _context.Entry(resource).State = EntityState.Modified;
            
            try
            {
                await _context.SaveChangesAsync();
                return resource;
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await ResourceExistsAsync(resource.Id))
                {
                    return null;
                }
                throw;
            }
        }
        
        public async Task<bool> DeleteResourceAsync(int id)
        {
            var resource = await _context.Resources.FindAsync(id);
            if (resource == null)
            {
                return false;
            }
            
            // Check if the resource is assigned to any tasks
            bool isAssigned = await _context.TaskResourceAssignments
                .AnyAsync(a => a.ResourceId == id);
            
            if (isAssigned)
            {
                // Cannot delete a resource that is assigned to tasks
                return false;
            }
            
            _context.Resources.Remove(resource);
            await _context.SaveChangesAsync();
            return true;
        }
        
        private async Task<bool> ResourceExistsAsync(int id)
        {
            return await _context.Resources.AnyAsync(r => r.Id == id);
        }
    }
}
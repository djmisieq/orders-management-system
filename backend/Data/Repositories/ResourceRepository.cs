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
            return await _context.Resources.OrderBy(r => r.Name).ToListAsync();
        }
        
        public async Task<Resource> GetResourceByIdAsync(int id)
        {
            return await _context.Resources.FindAsync(id);
        }
        
        public async Task<IEnumerable<Resource>> GetResourcesByTypeAsync(string resourceType)
        {
            return await _context.Resources
                .Where(r => r.ResourceType == resourceType)
                .OrderBy(r => r.Name)
                .ToListAsync();
        }
        
        public async Task<IEnumerable<Resource>> GetResourcesByDepartmentAsync(string department)
        {
            return await _context.Resources
                .Where(r => r.Department == department)
                .OrderBy(r => r.Name)
                .ToListAsync();
        }
        
        public async Task<IEnumerable<Resource>> GetAvailableResourcesAsync(DateTime startTime, DateTime endTime)
        {
            // Get all resources
            var allResources = await _context.Resources
                .Where(r => r.IsActive)
                .ToListAsync();
            
            // Get all resources that are already assigned during the requested time period
            var busyResourceIds = await _context.TaskResourceAssignments
                .Where(tra => 
                    (tra.StartTime <= endTime && tra.EndTime >= startTime) // Overlapping time period
                )
                .Select(tra => tra.ResourceId)
                .Distinct()
                .ToListAsync();
            
            // Return resources that are not in the busy list
            return allResources.Where(r => !busyResourceIds.Contains(r.Id)).ToList();
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
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await ResourceExistsAsync(resource.Id))
                {
                    return null;
                }
                throw;
            }
            
            return resource;
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
                .AnyAsync(tra => tra.ResourceId == id);
            
            if (isAssigned)
            {
                // Don't delete, just mark as inactive
                resource.IsActive = false;
                await _context.SaveChangesAsync();
                return true;
            }
            
            // If not assigned, we can safely delete
            _context.Resources.Remove(resource);
            await _context.SaveChangesAsync();
            return true;
        }
        
        public async Task<bool> ResourceExistsAsync(int id)
        {
            return await _context.Resources.AnyAsync(r => r.Id == id);
        }
    }
}
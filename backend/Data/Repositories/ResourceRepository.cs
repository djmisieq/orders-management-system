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
            
            _context.Resources.Remove(resource);
            await _context.SaveChangesAsync();
            return true;
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
        
        public async Task<IEnumerable<Resource>> GetAvailableResourcesAsync(DateTime startTime, DateTime endTime)
        {
            // Get all resources
            var allResources = await _context.Resources.ToListAsync();
            
            // Get resources that are already assigned during the specified time period
            var assignedResourceIds = await _context.TaskResourceAssignments
                .Where(tra => 
                    (tra.StartTime <= endTime && tra.EndTime >= startTime) &&
                    tra.AllocationPercentage == 100) // Only consider fully allocated resources
                .Select(tra => tra.ResourceId)
                .Distinct()
                .ToListAsync();
            
            // Return resources that are not fully assigned during the time period
            return allResources.Where(r => !assignedResourceIds.Contains(r.Id) && r.IsActive);
        }
        
        public async Task<bool> IsResourceAvailableAsync(int resourceId, DateTime startTime, DateTime endTime)
        {
            // Check if resource exists and is active
            var resource = await _context.Resources.FindAsync(resourceId);
            if (resource == null || !resource.IsActive)
            {
                return false;
            }
            
            // Check if resource is already fully assigned during the specified time period
            var conflictingAssignments = await _context.TaskResourceAssignments
                .Where(tra => 
                    tra.ResourceId == resourceId &&
                    tra.StartTime <= endTime && 
                    tra.EndTime >= startTime &&
                    tra.AllocationPercentage == 100)
                .AnyAsync();
            
            return !conflictingAssignments;
        }
        
        public async Task<IDictionary<DateTime, decimal>> GetResourceLoadAsync(int resourceId, DateTime startDate, DateTime endDate)
        {
            // Get all assignments for the resource in the date range
            var assignments = await _context.TaskResourceAssignments
                .Where(tra => 
                    tra.ResourceId == resourceId &&
                    tra.StartTime <= endDate && 
                    tra.EndTime >= startDate)
                .ToListAsync();
            
            // Calculate load per day
            var result = new Dictionary<DateTime, decimal>();
            for (var date = startDate.Date; date <= endDate.Date; date = date.AddDays(1))
            {
                // Calculate total allocation percentage for this day
                decimal dailyLoad = 0;
                foreach (var assignment in assignments)
                {
                    // Check if assignment covers this day
                    if (assignment.StartTime.Date <= date && assignment.EndTime.Date >= date)
                    {
                        // Calculate hours of overlap for this day
                        var startOfDay = new DateTime(date.Year, date.Month, date.Day, 0, 0, 0);
                        var endOfDay = startOfDay.AddDays(1);
                        var assignmentStart = assignment.StartTime < startOfDay ? startOfDay : assignment.StartTime;
                        var assignmentEnd = assignment.EndTime > endOfDay ? endOfDay : assignment.EndTime;
                        
                        // Calculate hours of overlap
                        var hours = (assignmentEnd - assignmentStart).TotalHours;
                        
                        // Add to daily load (assuming 8-hour workday)
                        dailyLoad += (decimal)(hours / 8.0 * assignment.AllocationPercentage / 100.0);
                    }
                }
                
                result[date] = Math.Min(dailyLoad, 1.0m); // Cap at 100%
            }
            
            return result;
        }
        
        public async Task<IEnumerable<ProductionTask>> GetTasksForResourceAsync(int resourceId, DateTime startDate, DateTime endDate)
        {
            return await _context.TaskResourceAssignments
                .Where(tra => 
                    tra.ResourceId == resourceId &&
                    tra.StartTime <= endDate && 
                    tra.EndTime >= startDate)
                .Include(tra => tra.Task)
                .ThenInclude(t => t.Order)
                .Select(tra => tra.Task)
                .ToListAsync();
        }
        
        private async Task<bool> ResourceExistsAsync(int id)
        {
            return await _context.Resources.AnyAsync(r => r.Id == id);
        }
    }
}
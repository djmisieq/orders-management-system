using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OrdersManagement.Backend.Data;
using OrdersManagement.Backend.Models;

namespace OrdersManagement.Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ResourcesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ResourcesController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Resources
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Resource>>> GetResources()
        {
            return await _context.Resources.ToListAsync();
        }

        // GET: api/Resources/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Resource>> GetResource(int id)
        {
            var resource = await _context.Resources.FindAsync(id);

            if (resource == null)
            {
                return NotFound();
            }

            return resource;
        }
        
        // GET: api/Resources/type/Machine
        [HttpGet("type/{resourceType}")]
        public async Task<ActionResult<IEnumerable<Resource>>> GetResourcesByType(string resourceType)
        {
            return await _context.Resources
                .Where(r => r.ResourceType == resourceType)
                .ToListAsync();
        }
        
        // GET: api/Resources/department/Production
        [HttpGet("department/{department}")]
        public async Task<ActionResult<IEnumerable<Resource>>> GetResourcesByDepartment(string department)
        {
            return await _context.Resources
                .Where(r => r.Department == department)
                .ToListAsync();
        }

        // PUT: api/Resources/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutResource(int id, Resource resource)
        {
            if (id != resource.Id)
            {
                return BadRequest();
            }

            _context.Entry(resource).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ResourceExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/Resources
        [HttpPost]
        public async Task<ActionResult<Resource>> PostResource(Resource resource)
        {
            _context.Resources.Add(resource);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetResource", new { id = resource.Id }, resource);
        }

        // DELETE: api/Resources/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteResource(int id)
        {
            var resource = await _context.Resources.FindAsync(id);
            if (resource == null)
            {
                return NotFound();
            }

            // Check if the resource is assigned to any tasks
            var assignments = await _context.TaskResourceAssignments
                .Where(tra => tra.ResourceId == id)
                .ToListAsync();
                
            if (assignments.Any())
            {
                return BadRequest("Cannot delete resource that has assignments. Remove the assignments first.");
            }

            _context.Resources.Remove(resource);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        
        // GET: api/Resources/availability?startDate=2023-01-01&endDate=2023-01-31
        [HttpGet("availability")]
        public async Task<ActionResult<Dictionary<int, List<ResourceTimeSlot>>>> GetResourceAvailability(
            [FromQuery] DateTime startDate, 
            [FromQuery] DateTime endDate,
            [FromQuery] int? resourceId = null)
        {
            // Get all task resource assignments for the specified period
            var assignments = await _context.TaskResourceAssignments
                .Include(tra => tra.Resource)
                .Where(tra => 
                    (resourceId == null || tra.ResourceId == resourceId) &&
                    ((tra.StartTime >= startDate && tra.StartTime <= endDate) ||
                     (tra.EndTime >= startDate && tra.EndTime <= endDate) ||
                     (tra.StartTime <= startDate && tra.EndTime >= endDate)))
                .ToListAsync();
                
            var resources = resourceId.HasValue 
                ? await _context.Resources.Where(r => r.Id == resourceId).ToListAsync()
                : await _context.Resources.ToListAsync();
                
            var result = new Dictionary<int, List<ResourceTimeSlot>>();
            
            foreach (var resource in resources)
            {
                var slots = new List<ResourceTimeSlot>();
                var resourceAssignments = assignments
                    .Where(a => a.ResourceId == resource.Id)
                    .OrderBy(a => a.StartTime)
                    .ToList();
                    
                foreach (var assignment in resourceAssignments)
                {
                    slots.Add(new ResourceTimeSlot
                    {
                        StartTime = assignment.StartTime,
                        EndTime = assignment.EndTime,
                        TaskId = assignment.TaskId,
                        AllocationPercentage = assignment.AllocationPercentage
                    });
                }
                
                result.Add(resource.Id, slots);
            }
            
            return result;
        }

        private bool ResourceExists(int id)
        {
            return _context.Resources.Any(e => e.Id == id);
        }
    }
    
    // Helper class for returning resource availability
    public class ResourceTimeSlot 
    {
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public int TaskId { get; set; }
        public decimal AllocationPercentage { get; set; }
    }
}

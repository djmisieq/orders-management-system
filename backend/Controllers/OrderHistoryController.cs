using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using OrdersManagement.Backend.Data.Repositories;
using OrdersManagement.Backend.Models;

namespace OrdersManagement.Backend.Controllers
{
    [ApiController]
    [Route("api/orders/{orderId}/history")]
    public class OrderHistoryController : ControllerBase
    {
        private readonly IOrderHistoryRepository _historyRepository;
        private readonly IOrderRepository _orderRepository;
        private readonly ILogger<OrderHistoryController> _logger;
        
        public OrderHistoryController(
            IOrderHistoryRepository historyRepository,
            IOrderRepository orderRepository,
            ILogger<OrderHistoryController> logger)
        {
            _historyRepository = historyRepository;
            _orderRepository = orderRepository;
            _logger = logger;
        }
        
        // GET: api/orders/5/history
        [HttpGet]
        public async Task<ActionResult<IEnumerable<OrderHistory>>> GetOrderHistory(int orderId)
        {
            _logger.LogInformation($"Getting history for order {orderId}");
            
            // Check if order exists
            if (!await _orderRepository.OrderExistsAsync(orderId))
            {
                _logger.LogWarning($"Order with id {orderId} not found");
                return NotFound("Order not found");
            }
            
            var history = await _historyRepository.GetHistoryByOrderIdAsync(orderId);
            return Ok(history);
        }
        
        // GET: api/orders/5/history/1
        [HttpGet("{id}")]
        public async Task<ActionResult<OrderHistory>> GetHistoryEntry(int orderId, int id)
        {
            _logger.LogInformation($"Getting history entry {id} for order {orderId}");
            
            var historyEntry = await _historyRepository.GetHistoryEntryByIdAsync(id);
            
            if (historyEntry == null)
            {
                _logger.LogWarning($"History entry with id {id} not found");
                return NotFound();
            }
            
            // Ensure history entry belongs to the specified order
            if (historyEntry.OrderId != orderId)
            {
                _logger.LogWarning($"History entry {id} does not belong to order {orderId}");
                return BadRequest("History entry does not belong to the specified order");
            }
            
            return Ok(historyEntry);
        }
        
        // GET: api/orders/history/recent/10
        [HttpGet("/api/orders/history/recent/{count}")]
        public async Task<ActionResult<IEnumerable<OrderHistory>>> GetRecentHistoryEntries(int count = 10)
        {
            _logger.LogInformation($"Getting {count} recent history entries");
            
            var history = await _historyRepository.GetRecentHistoryEntriesAsync(count);
            return Ok(history);
        }
    }
}
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using OrdersManagement.Backend.Data.Repositories;
using OrdersManagement.Backend.Models;

namespace OrdersManagement.Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrdersController : ControllerBase
    {
        private readonly IOrderRepository _orderRepository;
        private readonly IOrderHistoryRepository _historyRepository;
        private readonly ILogger<OrdersController> _logger;

        public OrdersController(
            IOrderRepository orderRepository,
            IOrderHistoryRepository historyRepository,
            ILogger<OrdersController> logger)
        {
            _orderRepository = orderRepository;
            _historyRepository = historyRepository;
            _logger = logger;
        }

        // GET: api/Orders
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Order>>> GetOrders()
        {
            _logger.LogInformation("Getting all orders");
            var orders = await _orderRepository.GetAllOrdersAsync();
            return Ok(orders);
        }

        // GET: api/Orders/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Order>> GetOrder(int id)
        {
            _logger.LogInformation($"Getting order with id {id}");
            var order = await _orderRepository.GetOrderByIdAsync(id);

            if (order == null)
            {
                _logger.LogWarning($"Order with id {id} not found");
                return NotFound();
            }

            return Ok(order);
        }

        // POST: api/Orders
        [HttpPost]
        public async Task<ActionResult<Order>> CreateOrder(Order order)
        {
            _logger.LogInformation("Creating a new order");
            
            // Save order
            await _orderRepository.CreateOrderAsync(order);
            
            // Record history entry
            // TODO: In a real app, get the current user ID and name
            // For demo, we'll hardcode user info
            var historyEntry = OrderHistory.ForCreation(order, 1, "Administrator Systemu");
            await _historyRepository.AddHistoryEntryAsync(historyEntry);
            
            return CreatedAtAction(
                nameof(GetOrder), 
                new { id = order.Id }, 
                order);
        }

        // PUT: api/Orders/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateOrder(int id, Order order)
        {
            if (id != order.Id)
            {
                _logger.LogWarning($"Update order failed: Id mismatch - URL id: {id}, body id: {order.Id}");
                return BadRequest("Id mismatch");
            }
            
            // Get the original order for history tracking
            var originalOrder = await _orderRepository.GetOrderByIdAsync(id);
            if (originalOrder == null)
            {
                _logger.LogWarning($"Order with id {id} not found");
                return NotFound();
            }
            
            // Check if status changed to record specific history
            string oldStatus = originalOrder.Status;
            bool statusChanged = !string.IsNullOrEmpty(order.Status) && oldStatus != order.Status;

            _logger.LogInformation($"Updating order with id {id}");
            var updatedOrder = await _orderRepository.UpdateOrderAsync(order);
            
            if (updatedOrder == null)
            {
                _logger.LogWarning($"Update failed: Order with id {id} not found");
                return NotFound();
            }
            
            // Record history entry for update
            // TODO: In a real app, get the current user ID and name
            int userId = 1;
            string userName = "Administrator Systemu";
            
            // If status changed, add specific history entry
            if (statusChanged)
            {
                var statusHistoryEntry = OrderHistory.ForStatusChange(
                    updatedOrder, 
                    oldStatus, 
                    updatedOrder.Status,
                    userId,
                    userName);
                
                await _historyRepository.AddHistoryEntryAsync(statusHistoryEntry);
            }
            
            // Add general update history entry
            var updateHistoryEntry = OrderHistory.ForUpdate(
                originalOrder,
                updatedOrder,
                userId,
                userName);
            
            await _historyRepository.AddHistoryEntryAsync(updateHistoryEntry);

            return NoContent();
        }

        // DELETE: api/Orders/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteOrder(int id)
        {
            _logger.LogInformation($"Deleting order with id {id}");
            
            // Get order before deletion for history purposes
            var order = await _orderRepository.GetOrderByIdAsync(id);
            if (order == null)
            {
                _logger.LogWarning($"Order with id {id} not found");
                return NotFound();
            }
            
            var result = await _orderRepository.DeleteOrderAsync(id);
            
            if (!result)
            {
                _logger.LogWarning($"Delete failed: Order with id {id} not found");
                return NotFound();
            }
            
            // For deleted orders, we could consider keeping the history in a separate table
            // or adding a "DeletedOrders" table for audit purposes
            
            return NoContent();
        }
    }
}
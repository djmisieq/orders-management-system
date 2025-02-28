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
        private readonly ILogger<OrdersController> _logger;

        public OrdersController(
            IOrderRepository orderRepository,
            ILogger<OrdersController> logger)
        {
            _orderRepository = orderRepository;
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
            await _orderRepository.CreateOrderAsync(order);
            
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

            _logger.LogInformation($"Updating order with id {id}");
            var updatedOrder = await _orderRepository.UpdateOrderAsync(order);
            
            if (updatedOrder == null)
            {
                _logger.LogWarning($"Update failed: Order with id {id} not found");
                return NotFound();
            }

            return NoContent();
        }

        // DELETE: api/Orders/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteOrder(int id)
        {
            _logger.LogInformation($"Deleting order with id {id}");
            var result = await _orderRepository.DeleteOrderAsync(id);
            
            if (!result)
            {
                _logger.LogWarning($"Delete failed: Order with id {id} not found");
                return NotFound();
            }

            return NoContent();
        }
    }
}

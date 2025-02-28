using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using OrdersManagement.Backend.Data.Repositories;
using OrdersManagement.Backend.Models;

namespace OrdersManagement.Backend.Controllers
{
    [ApiController]
    [Route("api/orders/{orderId}/comments")]
    public class OrderCommentsController : ControllerBase
    {
        private readonly IOrderCommentRepository _commentRepository;
        private readonly IOrderRepository _orderRepository;
        private readonly ILogger<OrderCommentsController> _logger;

        public OrderCommentsController(
            IOrderCommentRepository commentRepository,
            IOrderRepository orderRepository,
            ILogger<OrderCommentsController> logger)
        {
            _commentRepository = commentRepository;
            _orderRepository = orderRepository;
            _logger = logger;
        }

        // GET: api/orders/5/comments
        [HttpGet]
        public async Task<ActionResult<IEnumerable<OrderComment>>> GetOrderComments(int orderId)
        {
            _logger.LogInformation($"Getting comments for order {orderId}");
            
            // Check if order exists
            if (!await _orderRepository.OrderExistsAsync(orderId))
            {
                _logger.LogWarning($"Order with id {orderId} not found");
                return NotFound("Order not found");
            }
            
            var comments = await _commentRepository.GetCommentsByOrderIdAsync(orderId);
            return Ok(comments);
        }

        // GET: api/orders/5/comments/1
        [HttpGet("{id}")]
        public async Task<ActionResult<OrderComment>> GetOrderComment(int orderId, int id)
        {
            _logger.LogInformation($"Getting comment {id} for order {orderId}");
            
            var comment = await _commentRepository.GetCommentByIdAsync(id);
            
            if (comment == null)
            {
                _logger.LogWarning($"Comment with id {id} not found");
                return NotFound();
            }
            
            // Ensure comment belongs to the specified order
            if (comment.OrderId != orderId)
            {
                _logger.LogWarning($"Comment {id} does not belong to order {orderId}");
                return BadRequest("Comment does not belong to the specified order");
            }
            
            return Ok(comment);
        }

        // POST: api/orders/5/comments
        [HttpPost]
        public async Task<ActionResult<OrderComment>> AddOrderComment(int orderId, OrderComment comment)
        {
            _logger.LogInformation($"Adding comment to order {orderId}");
            
            // Check if order exists
            if (!await _orderRepository.OrderExistsAsync(orderId))
            {
                _logger.LogWarning($"Order with id {orderId} not found");
                return NotFound("Order not found");
            }
            
            // Ensure the comment is associated with the correct order
            comment.OrderId = orderId;
            
            // TODO: In a real app, get the current user ID and name
            // For demo, we'll hardcode user info
            comment.UserId = 1; // Admin user
            comment.UserName = "Administrator Systemu";
            
            await _commentRepository.AddCommentAsync(comment);
            
            return CreatedAtAction(
                nameof(GetOrderComment),
                new { orderId = orderId, id = comment.Id },
                comment);
        }

        // PUT: api/orders/5/comments/1
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateOrderComment(int orderId, int id, OrderComment comment)
        {
            _logger.LogInformation($"Updating comment {id} for order {orderId}");
            
            if (id != comment.Id)
            {
                _logger.LogWarning("Comment ID mismatch");
                return BadRequest("Comment ID mismatch");
            }
            
            // Ensure comment belongs to the specified order
            if (comment.OrderId != orderId)
            {
                _logger.LogWarning($"Comment {id} does not belong to order {orderId}");
                return BadRequest("Comment does not belong to the specified order");
            }
            
            var updatedComment = await _commentRepository.UpdateCommentAsync(comment);
            
            if (updatedComment == null)
            {
                _logger.LogWarning($"Comment with id {id} not found");
                return NotFound();
            }
            
            return NoContent();
        }

        // DELETE: api/orders/5/comments/1
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteOrderComment(int orderId, int id)
        {
            _logger.LogInformation($"Deleting comment {id} from order {orderId}");
            
            var comment = await _commentRepository.GetCommentByIdAsync(id);
            
            if (comment == null)
            {
                _logger.LogWarning($"Comment with id {id} not found");
                return NotFound();
            }
            
            // Ensure comment belongs to the specified order
            if (comment.OrderId != orderId)
            {
                _logger.LogWarning($"Comment {id} does not belong to order {orderId}");
                return BadRequest("Comment does not belong to the specified order");
            }
            
            await _commentRepository.DeleteCommentAsync(id);
            
            return NoContent();
        }
    }
}
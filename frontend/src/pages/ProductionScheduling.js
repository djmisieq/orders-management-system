import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Button, Tabs, Tab, Alert, Spinner } from 'react-bootstrap';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
import { format, addMonths, startOfMonth, endOfMonth } from 'date-fns';

// Services
import { getCalendarTasks, rescheduleTask } from '../services/productionTaskService';
import { getAllResources } from '../services/resourceService';

// Components
import TaskCreateModal from '../components/scheduling/TaskCreateModal';
import TaskDetailsModal from '../components/scheduling/TaskDetailsModal';
import ResourcesPanel from '../components/scheduling/ResourcesPanel';

const ProductionScheduling = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [resources, setResources] = useState([]);
  const [selectedTab, setSelectedTab] = useState('calendar');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTaskDetailsModal, setShowTaskDetailsModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [viewType, setViewType] = useState('month');
  
  const calendarRef = useRef(null);
  
  // Mock user info - in a real app, this would come from authentication context
  const currentUser = {
    id: 1,
    name: 'Administrator Systemu',
    role: 'Admin'
  };
  
  useEffect(() => {
    // Load data when component mounts or date changes
    loadData();
  }, [selectedDate, viewType]);
  
  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Calculate date range
      const startDate = startOfMonth(selectedDate);
      const endDate = endOfMonth(addMonths(selectedDate, 1)); // Get 2 months of data
      
      // Fetch resources and tasks
      const [resourcesData, tasksData] = await Promise.all([
        getAllResources(),
        getCalendarTasks(startDate, endDate)
      ]);
      
      setResources(resourcesData);
      
      // Format tasks for FullCalendar
      const formattedTasks = tasksData.map(task => ({
        id: task.id.toString(),
        title: task.title,
        start: task.start,
        end: task.end,
        backgroundColor: task.color,
        borderColor: task.color,
        textColor: '#ffffff',
        extendedProps: {
          orderId: task.orderId,
          orderName: task.orderName,
          status: task.status,
          progress: task.progress,
          resourceIds: task.resourceIds
        }
      }));
      
      setTasks(formattedTasks);
    } catch (err) {
      setError('Nie udało się załadować danych harmonogramu. Spróbuj ponownie później.');
      console.error('Error loading scheduling data:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDateChange = (dateInfo) => {
    setSelectedDate(dateInfo.start);
  };
  
  const handleEventClick = (info) => {
    const taskId = parseInt(info.event.id);
    setSelectedTask(taskId);
    setShowTaskDetailsModal(true);
  };
  
  const handleEventDrop = async (info) => {
    try {
      const taskId = parseInt(info.event.id);
      const newStartDate = info.event.start;
      
      // Call API to update the task schedule
      await rescheduleTask(
        taskId, 
        newStartDate, 
        currentUser.id, 
        currentUser.name
      );
      
      // Reload data to get any conflicts or updates
      await loadData();
    } catch (err) {
      console.error('Error rescheduling task:', err);
      info.revert(); // Revert the drag if there was an error
      setError('Nie udało się zmienić harmonogramu zadania. Spróbuj ponownie później.');
    }
  };
  
  const handleAddTask = () => {
    setShowCreateModal(true);
  };
  
  const handleTaskCreated = () => {
    setShowCreateModal(false);
    loadData(); // Reload data after task creation
  };
  
  const handleTaskUpdated = () => {
    setShowTaskDetailsModal(false);
    loadData(); // Reload data after task update
  };
  
  const handleViewChange = (newView) => {
    setViewType(newView);
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.changeView(newView);
    }
  };
  
  return (
    <Container fluid className="p-4">
      <h1>Harmonogram produkcji</h1>
      
      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}
      
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Body>
              <div className="d-flex justify-content-between mb-3">
                <div>
                  <Button variant="primary" onClick={handleAddTask} className="me-2">
                    Dodaj zadanie
                  </Button>
                  <Button 
                    variant={viewType === 'dayGridMonth' ? 'secondary' : 'outline-secondary'} 
                    onClick={() => handleViewChange('dayGridMonth')}
                    className="me-2"
                  >
                    Miesiąc
                  </Button>
                  <Button 
                    variant={viewType === 'timeGridWeek' ? 'secondary' : 'outline-secondary'} 
                    onClick={() => handleViewChange('timeGridWeek')}
                    className="me-2"
                  >
                    Tydzień
                  </Button>
                  <Button 
                    variant={viewType === 'timeGridDay' ? 'secondary' : 'outline-secondary'} 
                    onClick={() => handleViewChange('timeGridDay')}
                    className="me-2"
                  >
                    Dzień
                  </Button>
                  <Button 
                    variant={viewType === 'resourceTimeline' ? 'secondary' : 'outline-secondary'} 
                    onClick={() => handleViewChange('resourceTimeline')}
                  >
                    Zasoby
                  </Button>
                </div>
                <Button variant="outline-primary" onClick={loadData}>
                  Odśwież
                </Button>
              </div>
              
              <Tabs
                activeKey={selectedTab}
                onSelect={(key) => setSelectedTab(key)}
                className="mb-3"
              >
                <Tab eventKey="calendar" title="Kalendarz">
                  {loading ? (
                    <div className="text-center py-5">
                      <Spinner animation="border" role="status">
                        <span className="visually-hidden">Ładowanie...</span>
                      </Spinner>
                    </div>
                  ) : (
                    <div className="calendar-container">
                      <FullCalendar
                        ref={calendarRef}
                        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, resourceTimelinePlugin]}
                        initialView="dayGridMonth"
                        headerToolbar={{
                          left: 'prev,next today',
                          center: 'title',
                          right: ''
                        }}
                        events={tasks}
                        editable={true}
                        droppable={true}
                        selectable={true}
                        selectMirror={true}
                        dayMaxEvents={true}
                        weekends={true}
                        height="auto"
                        datesSet={handleDateChange}
                        eventClick={handleEventClick}
                        eventDrop={handleEventDrop}
                        resources={resources.map(resource => ({
                          id: resource.id.toString(),
                          title: resource.name
                        }))}
                        resourceAreaWidth="20%"
                        resourceGroupField="resourceType"
                        views={{
                          resourceTimeline: {
                            type: 'resourceTimeline',
                            duration: { days: 7 }
                          }
                        }}
                      />
                    </div>
                  )}
                </Tab>
                <Tab eventKey="resources" title="Zasoby">
                  <ResourcesPanel 
                    resources={resources}
                    onResourcesChange={loadData}
                  />
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Modals */}
      <TaskCreateModal 
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        onTaskCreated={handleTaskCreated}
        resources={resources}
        currentUser={currentUser}
      />
      
      <TaskDetailsModal
        show={showTaskDetailsModal}
        onHide={() => setShowTaskDetailsModal(false)}
        taskId={selectedTask}
        onTaskUpdated={handleTaskUpdated}
        resources={resources}
        currentUser={currentUser}
      />
    </Container>
  );
};

export default ProductionScheduling;
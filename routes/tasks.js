var express = require('express');
var router = express.Router();
var uuid = require('uuid');
var fs = require('fs');

/* Helper functions */
var tasklist=JSON.parse(fs.readFileSync('tasklist.json', 'utf8'));

function write_to_file(tasklist) {
  fs.writeFileSync('tasklist.json', JSON.stringify(tasklist), 'utf8');
}

/* Returns the days left of each task in order */
function to_days(tasklist) {
  for(task of tasklist) {
    task.days_left = parseInt(((new Date(task.endDate)) - (new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()))) / (1000 * 60 * 60 * 24), 10);
  }
  return tasklist;
}

/* Sorts the tasks by due date */
function sort(tasklist) {
  tasklist.sort((x, y) => (x.days_left > y.days_left) ? 1 : -1);
  tasklist.sort((x, y) => (x.priority < y.priority) ? 1 : -1);
  return tasklist;
}
/* End of helper functions */

/* Get all the tasks. */
router.get('/', (req, res, next) => {
  res.render('tasks', { tasks: sort(to_days(tasklist)) });
});

/* Directs to the page with a form for new task. */
router.get('/add', (req, res, next) => {
  res.render('newtask', {});
});

/* Accepts the form and adds a new task to the tasklist. */
router.post('/add', (req, res, next) => {
  var newTask = {
    id: uuid.v4(),
    name: req.body.name,
    endDate: req.body.endDate,
    description: req.body.description,
    priority: false,
  };

  tasklist.push(newTask);
  write_to_file(tasklist);
  res.render('tasks', { tasks: sort(to_days(tasklist)) });
});

/* Delete task(s) from the tasklist. */
router.post('/', (req, res, next) => {
  if(typeof req.body.ids == 'object') {
    for(id of req.body.ids) {
      tasklist = tasklist.filter(elem => elem.id !== id);
    }
  }
  else {
    tasklist = tasklist.filter(elem => elem.id !== req.body.ids);
  }
  write_to_file(tasklist);
  res.render('tasks', { tasks: sort(to_days(tasklist)) });
});

/* Get single task */
router.get('/:id', (req, res, next) => {
  var found = false;
  var taskHit = {};
  for(task of tasklist) {
    if(task.id === req.params.id) {
      found = true;
      taskHit = task;
    }
  }
  if(found) {
    res.render('task', {task: taskHit});
  }
  else {
    res.render('taskNotFoundError', {});
  }
});

/* Update Description of a task */
router.post('/:id', (req, res, next) => {
  tasklistTemp = [];
  taskHit = {};
  for(task of tasklist) {
    taskTemp = task;
    if(taskTemp.id === req.params.id) {
      taskTemp.description = req.body.description;
      taskHit = taskTemp;
    }
    tasklistTemp.push(taskTemp);
  }
  tasklist = tasklistTemp;
  write_to_file(tasklist);
  res.render('task', {task: taskHit});
});

/* Toggle Priority of a task */
router.post('/:id/priority', (req, res, next) => {
  tasklistTemp = [];
  taskHit = {};
  for(task of tasklist) {
    taskTemp = task;
    if(taskTemp.id === req.params.id) {
      taskTemp.priority = !taskTemp.priority;
      taskHit = taskTemp;
    }
    tasklistTemp.push(taskTemp);
  }
  tasklist = tasklistTemp;
  console.log(taskHit)
  write_to_file(tasklist);
  res.render('task', {task: taskHit});
});

module.exports = router;

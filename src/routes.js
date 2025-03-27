import React from 'react'


const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const ClientPage = React.lazy(() => import('./views/client/ClientPage'))
const Teams = React.lazy(() => import('./views/teams/Teams'))
const Calendar = React.lazy(() => import('./views/calendar/Calendar'))
const WorkoutDetailPage = React.lazy(() => import('./views/client/WorkoutDetailPage'))

const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/calendar', name: 'Calendar', element: Calendar },
  { path: '/client/:clientEmail', name: 'Client', element: ClientPage },
  { path: '/teams', name: 'Teams', element: Teams },
  { path: '/client/:clientEmail/workout/:workoutId', name: 'Workout', element: WorkoutDetailPage },
]

export default routes

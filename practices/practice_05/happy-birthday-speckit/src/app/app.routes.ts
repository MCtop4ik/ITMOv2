import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'Дни рождения',
    loadComponent: () => import('./birthdays/presentation/home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'friends',
    title: 'Мои друзья',
    loadComponent: () => import('./friends/presentation/friends.page').then((m) => m.FriendsPage),
  },
  {
    path: 'people',
    title: 'Все люди',
    loadComponent: () => import('./people/presentation/people-list/people.page').then((m) => m.PeoplePage),
  },
  {
    path: 'people/:id',
    title: 'Карточка',
    loadComponent: () =>
      import('./people/presentation/person-card/person-card.page').then((m) => m.PersonCardPage),
  },
  {
    path: 'calendar',
    title: 'Календарь',
    loadComponent: () => import('./birthdays/presentation/calendar/calendar.page').then((m) => m.CalendarPage),
  },
  {
    path: 'calendar/:month',
    title: 'Календарь',
    loadComponent: () => import('./birthdays/presentation/calendar/calendar.page').then((m) => m.CalendarPage),
  },
  {
    path: 'stats',
    title: 'Статистика',
    loadComponent: () => import('./statistics/presentation/stats.page').then((m) => m.StatsPage),
  },
  { path: '**', redirectTo: '' },
];

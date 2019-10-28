import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {
  AngularFireAuthGuard,
  redirectUnauthorizedTo
} from '@angular/fire/auth-guard';

import { LoginComponent } from './pages/login/login.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { UsersComponent } from './pages/users/users.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';
import { LayoutAdminComponent } from './layouts/layout-admin/layout-admin.component';
import { LayoutBlankComponent } from './layouts/layout-blank/layout-blank.component';
import { UserDetailComponent } from './pages/user-detail/user-detail.component';

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['login']);

const routes: Routes = [
  {
    path: 'login',
    component: LayoutBlankComponent,
    children: [{ path: '', component: LoginComponent }]
  },
  {
    path: '',
    component: LayoutAdminComponent,
    canActivate: [AngularFireAuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin },
    children: [
      { path: 'apps', loadChildren: () => import('./modules/application/application.module').then(mod => mod.ApplicationModule) },
      { path: 'pages', loadChildren: () => import('./modules/page/page.module').then(mod => mod.PageModule) },
      { path: 'user-interface', loadChildren: () => import('./modules/user-interface/user-interface.module')
      .then(mod => mod.UserInterfaceModule) },
      { path: 'ant-elements', loadChildren: () => import('./modules/ant-elements/ant-elements.module').then(mod => mod.AntElementsModule)},
      { path: 'docs', loadChildren: () => import('./modules/documentation/documentation.module').then(mod => mod.DocumentationModule)}
    ]
  },
  {
    path: '**',
    component: LayoutBlankComponent,
    children: [{ path: '', component: PageNotFoundComponent }]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}

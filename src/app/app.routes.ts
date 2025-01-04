import { Routes } from '@angular/router';
import { HomePageComponent } from './components/home-page/home-page.component';
import { SearchPageComponent } from './components/search-page/search-page.component';
import { LoginFormComponent } from './components/login-form/login-form.component';
import { ServiceCrudComponent } from './components/service/service-crud/service-crud.component';
import { RegisterEoFormComponent } from './components/register-eo-form/register-eo-form.component';
import { RegisterSpFormComponent } from './components/register-sp-form/register-sp-form.component';
import { EditAuFormComponent } from './components/edit-au-form/edit-au-form.component';
import { EditEoFormComponent } from './components/edit-eo-form/edit-eo-form.component';
import { EditSpFormComponent } from './components/edit-sp-form/edit-sp-form.component';
import { ChangePasswordComponent } from './components/change-password/change-password.component';
import { FastRegisterComponent } from './components/fast-register/fast-register.component';
import { MyEventsComponent } from './components/my-events/my-events.component';
import { EventTypesComponent } from './components/event-types/event-types.component';
import { CreateEventFormComponent } from './components/create-event-form/create-event-form.component';
import { EditEventFormComponent } from './components/edit-event-form/edit-event-form.component';
import { AgendaComponent } from './components/agenda/agenda.component';
import { CategoryCrudComponent } from './components/category/category-crud/category-crud.component';
import { ServiceDetailsComponent } from './components/service/service-details/service-details.component';
import { FollowedEventsComponent } from './components/followed-events/followed-events.component';
import { ProdcutDetailsComponent } from './components/product-details/prodcut-details.component';
import { MessagingPageComponent } from './components/messaging-page/messaging-page.component';
import { AdminUserReportsComponent } from './components/admin-user-reports/admin-user-reports/admin-user-reports.component';
import { ProductsCrudComponent } from './components/products-crud/products-crud.component';
import { UpdateProductComponent } from './components/update-product/update-product.component';
import { CreateProductComponent } from './components/create-product/create-product.component';
import { AdminReviewsComponent } from './components/admin-reviews/admin-reviews.component';
import { EventDetailsComponent } from './components/event-details/event-details.component';
import { FavoriteEventsComponent } from './components/favorite-events/favorite-events.component';
import { FavoriteMerchandiseComponent } from './components/favorite-merchandise/favorite-merchandise.component';
import { AddActivityFormComponent } from './components/add-activity-form/add-activity-form.component';
import { EditActivityFormComponent } from './components/edit-activity-form/edit-activity-form.component';
import { CreateActivityFormComponent } from './components/create-activity-form/create-activity-form.component';
import { BudgetComponent } from './components/budget/budget.component';
import { PriceListComponent } from './components/price-list/price-list.component';
import { AuthGuard } from './components/auth/auth-guard';
import { EoGuard } from './components/auth/eo-guard';
import { SpGuard } from './components/auth/sp-guard';
import { AdminGuard } from './components/auth/admin-guard';
import { AuGuard } from './components/auth/au-guard';
import { GuestGuard } from './components/auth/guest-guard';


export const routes: Routes = [
    {
        path: 'home',
        data:{
            breadcrumb:null
        },
        children: [
            {
                path: '',
                data:{
                    breadcrumb:null
                },
                component: HomePageComponent
            },
            {
                path: 'search',
                data:{
                    breadcrumb:'Search'
                },
                component: SearchPageComponent
            },
            {
                path: 'my_services',
                data:{
                    breadcrumb:'My services'
                },
                component: ServiceCrudComponent,
                canActivate: [AuthGuard, SpGuard]
            },
            {
                path: 'my_products',
                data:{
                    breadcrumb:'My products'
                },
                component: ProductsCrudComponent,
                canActivate: [AuthGuard, SpGuard]
            },
            {
                path: 'edit-product/:id',
                data:{
                    breadcrumb: null
                },
                component: UpdateProductComponent,
                canActivate: [AuthGuard, SpGuard]
            },
            {
                path: 'create-product',
                data:{
                    breadcrumb: null
                },
                component: CreateProductComponent,
                canActivate: [AuthGuard, SpGuard]
            },
            {
                path: 'my_events',
                data:{
                    breadcrumb:'My events'
                },
                component: MyEventsComponent,
                canActivate: [AuthGuard, EoGuard]
            },
            {
                path: 'event-types',
                data:{
                    breadcrumb:'Event Types'
                },
                component: EventTypesComponent,
                canActivate: [AuthGuard, AdminGuard]
            },
            {
                path: 'create-event',
                data:{
                    breadcrumb: null
                },
                component: CreateEventFormComponent,
                canActivate: [AuthGuard, EoGuard]
            },
            {
                path: 'edit-event/:id',
                data:{
                    breadcrumb: null
                },
                component: EditEventFormComponent,
                canActivate: [AuthGuard, EoGuard]
            },
            {
                path: 'event-details/:id',
                data:{
                    breadcrumb: null
                },
                component: EventDetailsComponent
            },
            {
                path: 'category',
                data: {
                    breadcrumb: 'Categories'
                },
                component: CategoryCrudComponent,
                canActivate: [AuthGuard, AdminGuard]
            }
            ,
            {
                path: 'service/:id',
                data: {
                    breadcrumb: 'Service'
                },
                component: ServiceDetailsComponent
            },
            {
                path: 'product/:productId/:eventId',
                data: {
                    breadcrumb: 'Product'
                },
                component: ProdcutDetailsComponent
            },
            {
                path: 'followed-events',
                data: {
                    breadcrumb: 'Followed Events'
                },
                component: FollowedEventsComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'messenger/:serviceProviderId',
                data: {
                    breadcrumb: 'Messenger'
                },
                component: MessagingPageComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'admin-user-reports',
                data: {
                    breadcrumb: 'User Reports'
                },
                component: AdminUserReportsComponent,
                canActivate: [AuthGuard, AdminGuard]
            },
            {
                path: 'admin-reviews',
                data: {
                    breadcrumb: 'Reviews'
                },
                component: AdminReviewsComponent,
                canActivate: [AuthGuard, AdminGuard]
            },
            {
                path: 'favorite-events',
                data: {
                    breadcrumb: 'Favorite Events'
                },
                component: FavoriteEventsComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'favorite-merchandise',
                data: {
                    breadcrumb: 'Favorite Services/Products'
                },
                component: FavoriteMerchandiseComponent,
                canActivate: [AuthGuard]
            } ,
            {
                path: 'agenda/:id',
                data: {
                    breadcrumb: 'Agenda'
                },
                component: AgendaComponent
            },
            {
                path: 'agenda/:id/add',
                data: {
                    breadcrumb: 'Agenda'
                },
                component: CreateActivityFormComponent,
                canActivate: [AuthGuard, EoGuard]
            },
            {
                path: 'agenda/edit/:activityId',
                data: {
                    breadcrumb: 'Agenda'
                },
                component: EditActivityFormComponent,
                canActivate: [AuthGuard, EoGuard]
            },
            {
                path: 'budget/:eventId',
                data: {
                    breadcrumb: "Budget"
                },
                component: BudgetComponent,
                canActivate: [AuthGuard] // ne znam ko sme
            },
            {
                path: 'price-list',
                data: {
                    breadcrumb: "Price List"
                },
                component: PriceListComponent,
                canActivate: [AuthGuard, SpGuard, AdminGuard]
            }
        ]
    },
    { path: '', component: LoginFormComponent},
    { path: 'change-password/:id', component: ChangePasswordComponent, canActivate: [AuthGuard]},
    { path: 'register-au', component: FastRegisterComponent},
    { path: 'register-eo', component: RegisterEoFormComponent},
    { path: 'register-sp', component: RegisterSpFormComponent},
    { path: 'edit-au/:id', component: EditAuFormComponent, canActivate: [AuthGuard, AuGuard]},
    { path: 'edit-eo/:id', component: EditEoFormComponent, canActivate: [AuthGuard, EoGuard]},
    { path: 'edit-sp/:id', component: EditSpFormComponent, canActivate: [AuthGuard, SpGuard]},
    
];

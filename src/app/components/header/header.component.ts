import { Component, ElementRef, ViewChild } from '@angular/core';
import { ToolbarModule } from 'primeng/toolbar';
import { SplitButtonModule } from 'primeng/splitbutton';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { FormsModule } from '@angular/forms';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { MenuItem } from 'primeng/api';
import { MenubarModule } from 'primeng/menubar';
import { SidebarModule } from 'primeng/sidebar';
import { SidebarNotificationsComponent } from "../sidebar-notifications/sidebar-notifications.component";
import { DialogModule } from 'primeng/dialog';
import { LoginFormComponent } from "../login-form/login-form.component";
import { RegisterSpFormComponent } from "../register-sp-form/register-sp-form.component";
import { RegisterEoFormComponent } from '../register-eo-form/register-eo-form.component';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { ThemeService } from '../../theme.service';
import { SideMenuComponent } from "../side-menu/side-menu.component";
import { Router } from '@angular/router';
import { SearchService } from '../search-page/search.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [ToolbarModule, ScrollPanelModule, DialogModule, SplitButtonModule, InputTextModule, ButtonModule, InputIconModule, IconFieldModule, FormsModule, AvatarModule, AvatarGroupModule, MenubarModule, SidebarModule,  SidebarNotificationsComponent, SideMenuComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  items: MenuItem[] | undefined;
  username: string = "Goci Ristic";
  sidemenuVisible: boolean = false;
  notificationsVisible: boolean = false;
  searchText:string='';
  
  constructor(private themeService:ThemeService, private router: Router,private searchService:SearchService){}

    changeTheme() {
        this.themeService.changeTheme();
    }
    ngOnInit() {
      this.items = [
        {
            label: this.username,
            icon: '',
            items: [
                {
                    label: 'Profile',
                    icon: 'pi pi-user'
                },
                {
                    label: 'Settings',
                    icon: 'pi pi-cog'
                },
                {
                    label: 'Help',
                    icon: 'pi pi-question'
                },
                {
                    label: 'Logout',
                    icon: 'pi pi-sign-out',
                    command: () => this.logout(),
                }
            ]
        }
    ]
    }

    logout(){
        this.router.navigate(['']);
    }
    onSearchChange() {
        this.searchService.updateSearch(this.searchText);
        
      }
}

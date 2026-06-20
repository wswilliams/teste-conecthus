import { bootstrapApplication } from '@angular/platform-browser';
import { importProvidersFrom } from '@angular/core';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { enableProdMode } from '@angular/core';
import { JwtHelperService, JWT_OPTIONS } from "@auth0/angular-jwt";
import { JwtInterceptor } from './app/interceptors/jwt.interceptor';
import { WINDOW_PROVIDERS } from './app/window-token';
import { appRoutes } from './app/app-routing.module';
import { RouterModule } from '@angular/router';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(BrowserAnimationsModule),
    importProvidersFrom(HttpClientModule),
    importProvidersFrom(RouterModule.forRoot(appRoutes)),
    WINDOW_PROVIDERS,
    JwtHelperService,
    { provide: JWT_OPTIONS, useValue: JWT_OPTIONS },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true
    }
  ]
}).catch(err => console.error(err));

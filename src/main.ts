import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, Routes } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { AppComponent } from './app/app.component';
import { HomeComponent } from './app/pages/home/home.component';
import { AuthComponent } from './app/components/auth/auth.component';
import { TrackerComponent } from './app/pages/tracker/tracker.component';
import { CrudComponent } from './app/pages/crud/crud.component';
import { AboutusComponent } from './app/pages/aboutus/aboutus.component';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { firebaseConfig } from './environment';
import { AuthGuard } from './app/guards/auth.guard';

const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: '', component: HomeComponent },
  { path: 'auth', component: AuthComponent },
  { path: 'track', component: TrackerComponent, canActivate: [AuthGuard] },
  { path: 'about-us', component: AboutusComponent },
  { path: 'crud', component: CrudComponent },
];

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideFirestore(() => getFirestore()),
  ],
});

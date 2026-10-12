import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { Header } from './layout/header/header';
import { routes } from './app.routes';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the router outlet', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('router-outlet')).not.toBeNull();
  });

  it('provides an accessible relationship between the mobile menu button and navigation', () => {
    const fixture = TestBed.createComponent(Header);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('.menu') as HTMLButtonElement;
    expect(button.getAttribute('aria-controls')).toBe('main-navigation');
  });

  it('declares separate protected Admin and Agent dashboards', () => {
    const admin = routes.find((route) => route.path === 'dashboard/admin');
    const agent = routes.find((route) => route.path === 'dashboard/agent');
    expect(admin?.data?.['role']).toBe('admin');
    expect(agent?.data?.['role']).toBe('agent');
    expect(admin?.children?.some((route) => route.path === 'guichets')).toBe(true);
    expect(agent?.children?.some((route) => route.path === 'guichets')).toBe(false);
  });
});

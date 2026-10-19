import { TestBed } from '@angular/core/testing';
import { provideRouter, RouterLink } from '@angular/router';
import { AgentDashboard } from './agent-dashboard';

describe('AgentDashboard', () => {
  it('uses Angular links for all quick actions', () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(AgentDashboard);
    fixture.detectChanges();
    expect(
      fixture.debugElement.queryAll((element) => element.injector.get(RouterLink, null) !== null)
        .length,
    ).toBe(3);
  });
});

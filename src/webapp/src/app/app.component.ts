import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UserService } from '../services/user.service';
import { faDiscord, faGitlab, faPaypal, faTwitch, faTwitter } from '@fortawesome/free-brands-svg-icons';
import { faBug, faLanguage } from '@fortawesome/free-solid-svg-icons';
import { TranslateService } from '@ngx-translate/core';
import isoLang from '../assets/languages.json';
import moment from 'moment-timezone';
import { DateTimeAdapter } from '@busacca/ng-pick-datetime';
import { environment } from '../environments/environment';
import { MatomoInjector, MatomoTracker } from '@ambroise-rabier/ngx-matomo';
import { NavigationEnd, Router } from '@angular/router';
import { delay, filter, skip } from 'rxjs/operators';
import localeFr from '@angular/common/locales/fr';
import localeDe from '@angular/common/locales/de';
import localeNl from '@angular/common/locales/nl';
import localeJa from '@angular/common/locales/ja';
import localeCy from '@angular/common/locales/cy';
import localeEs from '@angular/common/locales/es';
import localePt from '@angular/common/locales/pt';
import localeZhHk from '@angular/common/locales/zh-Hant-HK';
import { registerLocaleData } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit {
  title = !environment.sandbox ? 'Oengus' : 'Oengus [Sandbox]';

  @ViewChild('navBurger', {static: true}) navBurger: ElementRef;
  @ViewChild('navMenu', {static: true}) navMenu: ElementRef;

  public faTwitter = faTwitter;
  public faDiscord = faDiscord;
  public faTwitch = faTwitch;
  public faBug = faBug;
  public faGitlab = faGitlab;
  public faPaypal = faPaypal;
  public faLanguage = faLanguage;
  public languages = (<any>isoLang);
  public language = localStorage.getItem('language') ? localStorage.getItem('language') : navigator.language.split('-')[0];
  public environment = environment;

  public availableLocales = ['en', 'fr', 'de', 'es', 'nl', 'ja', 'cy', 'pt_BR', 'zh_Hant_HK'];

  constructor(public userService: UserService,
              private translate: TranslateService,
              private dateTimeAdapter: DateTimeAdapter<any>,
              private matomoInjector: MatomoInjector,
              private matomoTracker: MatomoTracker,
              private router: Router) {
    registerLocaleData(localeFr, 'fr');
    registerLocaleData(localeDe, 'de');
    registerLocaleData(localeNl, 'nl');
    registerLocaleData(localeEs, 'es');
    registerLocaleData(localeJa, 'ja');
    registerLocaleData(localeCy, 'cy');
    registerLocaleData(localePt, 'pt_BR');
    registerLocaleData(localeZhHk, 'zh_Hant_HK');
    this.matomoInjector.init({
      url: 'https://matomo.oengus.io/',
      id: environment.matomoId,
      enableLinkTracking: true
    });
    translate.setDefaultLang('en');
    if (this.availableLocales.includes(this.language)) {
      this.useLanguage(this.language);
    } else {
      this.useLanguage('en');
    }
    if (!this.userService.user) {
      this.userService.me();
    }
  }

  ngOnInit(): void {
    this.matomoTracker.requireConsent();
    this.matomoTracker.trackPageView();
  }

  closeNotification(): void {
    localStorage.setItem('closed', 'true');
  }

  acceptPrivacyConsent(): void {
    this.matomoTracker.rememberConsentGiven();
    localStorage.setItem('consent', 'true');
  }

  declinePrivacyConsent(): void {
    this.matomoTracker.forgetConsentGiven();
    localStorage.setItem('consent', 'false');
  }

  consentWasGiven(): boolean {
    return localStorage.getItem('consent') !== null;
  }

  isClosed(): boolean {
    return localStorage.getItem('closed') !== null;
  }

  ngAfterViewInit(): void {
    let referrer: string = window.location.href;
    this.router.events.pipe(
      // filter out NavigationStart, Resolver, ...
      filter(e => e instanceof NavigationEnd),
      // skip first NavigationEnd fired when subscribing, already handled by init().
      skip(1),
      // idk why, used in angulartics2 lib.
      delay(0)
    ).subscribe(next => {
      // referrer is optional
      this.matomoInjector.onPageChange({referrer});
      referrer = window.location.href;
    });
  }

  useLanguage(language: string) {
    this.language = language;
    localStorage.setItem('language', language);
    this.translate.use(language);
    if (language === 'zh_Hant_HK') {
      moment.locale('zh_hk');
    } else {
      moment.locale(language.split('_')[0]);
    }
    this.dateTimeAdapter.setLocale(language.split('_')[0]);
  }

  toggleNavbar() {
    this.navBurger.nativeElement.classList.toggle('is-active');
    this.navMenu.nativeElement.classList.toggle('is-active');
  }

  getTimezone() {
    return moment.tz.guess();
  }

  twitterAuth() {
    this.userService.login('twitterAuth').subscribe(response => {
      window.location.replace(response.token);
    });
  }

}

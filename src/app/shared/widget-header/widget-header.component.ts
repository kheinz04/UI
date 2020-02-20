import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ComponentFactoryResolver,
  Input,
  OnInit, QueryList,
  Type,
  ViewChild,
  ViewChildren
} from '@angular/core';
import { interval } from 'rxjs';

import {ConfirmationModalComponent} from '../modals/confirmation-modal/confirmation-modal.component';
import {FormModalComponent} from '../modals/form-modal/form-modal.component';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {WidgetComponent} from '../widget/widget.component';
import {WidgetDirective} from '../widget/widget.directive';
import {DashboardService} from '../dashboard.service';
import {map, switchMap} from 'rxjs/operators';
import {zip} from 'rxjs';
import { extend } from 'lodash';
import {ISelectedWidget, IWidget} from '../interfaces';

@Component({
  selector: 'app-widget-header',
  templateUrl: './widget-header.component.html',
  styleUrls: ['./widget-header.component.scss']
})
export class WidgetHeaderComponent implements AfterViewInit {
  @Input() widgetList: IWidget[];
  @Input() widgetSize;
  @Input() widgetType: Type<any>;
  @Input() title;
  @Input() status;
  @Input() configForm: Type<any>;
  // @ViewChild(WidgetDirective) appWidget: WidgetDirective;
  @ViewChildren(WidgetDirective) childWidgetTags: QueryList<WidgetDirective>;
  private widgetComponents: WidgetComponent[] = [];
  private widgetTabActive;

  /** Auto Cycle variables */
  private timeoutPromise = null;
  private changeDetect = null;
  private pausePlaySymbol = 'play';
  private timerSubscription;

  constructor(private componentFactoryResolver: ComponentFactoryResolver,
              private cdr: ChangeDetectorRef,
              private modalService: NgbModal,
              private dashboardService: DashboardService) {
  }
  ngAfterViewInit() {
    this.loadComponent(this.childWidgetTags);
  }

  loadComponent(widgetTags: QueryList<WidgetDirective>) {
    if (!widgetTags) {
      return;
    }
    const widgetTagArray = widgetTags.toArray();
    for (let i = 0; i < widgetTagArray.length && i < this.widgetList.length; i++) {
      const componentFactory = this.componentFactoryResolver.resolveComponentFactory(this.widgetList[i].component);
      const viewContainerRef = widgetTagArray[i].viewContainerRef;
      viewContainerRef.clear();
      const componentRef = viewContainerRef.createComponent(componentFactory);
      const widgetComponent = ( componentRef.instance as WidgetComponent);
      this.widgetComponents.push(widgetComponent as WidgetComponent);
      this.widgetComponents[i].status = this.widgetList[i].status;
    }
    this.widgetTabActive = 0;
    this.cdr.detectChanges();
  }

  tabToggle(index) {
    this.widgetTabActive = this.widgetList[index] ? index : 0;
  }

  // Open the config modal and pass it necessary data. When it is closed pass the results to update them.
  openConfig(widgetIndex) {
    const modalRef = this.modalService.open(FormModalComponent);
    modalRef.componentInstance.title = 'Configure';
    modalRef.componentInstance.form = this.widgetList[this.widgetTabActive].configForm;
    modalRef.componentInstance.id = 1;

    this.widgetComponents[widgetIndex].getCurrentWidgetConfig().subscribe(result => {
      console.log(result);
      modalRef.componentInstance.widgetConfig = result;
    });
    // Take form data, combine with widget config, and pass to update function
    modalRef.result.then((newConfig) => {
      if (!newConfig) {
        return;
      }
      this.widgetComponents[widgetIndex].stopRefreshInterval();
      console.log(newConfig);
      this.updateWidgetConfig(newConfig, widgetIndex);
    }).catch((error) => {
      console.log(error);
    });
  }
  openConfirm() {
    const modalRef = this.modalService.open(ConfirmationModalComponent);
    modalRef.componentInstance.title = 'Are you sure want to delete this widget from your dashboard?';
    // modalRef.componentInstance.modalType = ConfirmationModalComponent;
  }
  updateWidgetConfig(newWidgetConfig: any, widgetIndex): void {
    if (!newWidgetConfig) {
      return;
    }

    // Take the current config and prepare it for saving
    const newWidgetConfig$ = this.widgetComponents[widgetIndex].getCurrentWidgetConfig().pipe(
      map( widgetConfig => {
        extend(widgetConfig, newWidgetConfig);
        return widgetConfig;
      }),
      map((widgetConfig: any) => {
        if (widgetConfig.collectorItemId) {
          widgetConfig.collectorItemIds = [widgetConfig.collectorItemId];
          delete widgetConfig.collectorItemId;
        }
        return widgetConfig;
      })
    );

    // Take the modified widgetConfig and upsert it.
    const upsertDashboardResult$ = newWidgetConfig$.pipe(
      switchMap(widgetConfig => {
        return this.dashboardService.upsertWidget(widgetConfig);
      }));

    // Take the new widget and the results from the API call
    // and have the dashboard service take this data to
    // publish the new config.
    zip(newWidgetConfig$, upsertDashboardResult$).pipe(
      map(([widgetConfig, upsertWidgetResponse]) => ({ widgetConfig, upsertWidgetResponse }))
    ).subscribe(result => {
      if (result.widgetConfig !== null && typeof result.widgetConfig === 'object') {
        extend(result.widgetConfig, result.upsertWidgetResponse.widget);
      }

      this.dashboardService.upsertLocally(result.upsertWidgetResponse.component, result.widgetConfig);

      // Push the new config to the widget, which
      // will trigger whatever is subscribed to
      // widgetConfig$
      this.widgetComponents[widgetIndex].widgetConfigSubject.next(result.widgetConfig);
      this.widgetComponents[widgetIndex].startRefreshInterval();
    });
  }
    /**
     * Changes timeout boolean to know whether or not to count down
     */
    startTimeout() {
      this.stopTimeout();
      this.timeoutPromise = interval(1000);
      this.timerSubscription = this.timeoutPromise.subscribe(val => this.animateQualityView(false));
    }

    /**
     * Stops the current cycle promise
     */
    stopTimeout() {
      if ( this.timerSubscription ) {
        this.timerSubscription.unsubscribe();
      }
    }

    /**
     * Animates quality view switching
     */
    animateQualityView(resetTimer) {
      // update the selected view
      const newIndex = this.widgetTabActive + 1;

      if (newIndex >= this.widgetList.length) {
        this.widgetTabActive = 0;
      } else {
        this.widgetTabActive = newIndex;
      }

      if (resetTimer && this.timerSubscription) {
        this.stopTimeout();
        this.pausePlaySymbol = 'play';
      }
    }

    /**
     * Pauses quality view switching via manual button from user interaction
     */
    pauseQualityView() {
      if (this.pausePlaySymbol === 'play') {
        this.pausePlaySymbol = 'pause';
        this.startTimeout();
      } else {
        this.pausePlaySymbol = 'play';
        this.stopTimeout();
      }
    };






}

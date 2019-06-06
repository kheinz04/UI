import {IWidget} from './interfaces';
import {PlaceholderWidgetComponent} from './widget/placeholder-widget/placeholder-widget.component';
import {BuildConfigFormComponent} from '../widget_modules/build/build-config-form/build-config-form.component';
import {BuildWidgetComponent} from '../widget_modules/build/build-widget/build-widget.component';


export let WIDGETS = {
  build: {
    title: 'Build',
    component: BuildWidgetComponent,
    status: 'Success',
    widgetSize: 'col-xl-6',
    configForm: BuildConfigFormComponent
  } as IWidget,
  placeholder: {
    title: 'Placeholder',
    component: PlaceholderWidgetComponent,
    status: 'Success',
    widgetSize: 'col-xl-4',
    configForm: BuildConfigFormComponent
  } as IWidget,
  placeholder_sm: {
    title: 'Placeholder',
    component: PlaceholderWidgetComponent,
    status: 'Success',
    widgetSize: 'col-xl-3',
    configForm: BuildConfigFormComponent
  } as IWidget
}

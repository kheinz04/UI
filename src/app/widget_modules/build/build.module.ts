import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from 'src/app/shared/shared.module';

import { BuildConfigFormComponent } from './build-config-form/build-config-form.component';
import { BuildRoutingModule } from './build-routing-module';
import { BuildWidgetComponent } from './build-widget/build-widget.component';

@NgModule({
  declarations: [BuildWidgetComponent, BuildConfigFormComponent],
  entryComponents: [BuildConfigFormComponent],
  imports: [
    BuildRoutingModule,
    CommonModule,
    NgbModule,
    SharedModule
  ],
  exports: [
  ]
})
export class BuildModule { }

import { Type } from '@angular/core';

export interface IUserLogin {
  username: string;
  password: string;
}
export interface IUser {
  sub: string;
  details: string;
  roles: any;
  exp: number;
}
export interface IPaginationParams {
  page: number;
  pageSize: any;
}

export interface IChart {
  title: string;
  component: Type<any>;
  data: any;
  xAxisLabel: string;
  yAxisLabel: string;
  colorScheme: any;
}

export interface IWidget {
  title: string;
  component: Type<any>;
  status: string;
  widgetSize: string;
  configForm: Type<any>;
}

export interface ISelectedWidget {
  title: string;
  index: number;
}

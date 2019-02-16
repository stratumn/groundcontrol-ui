// Copyright 2019 Stratumn
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import React, { Component } from "react";
import { Radio } from "semantic-ui-react";

import "./JobFilter.css";

export interface IProps {
  status?: string[];
  onChange: (values: IProps) => any;
}

export const allStatus = ["QUEUED", "RUNNING", "STOPPING", "DONE", "FAILED"];

// Note: we consider undefined filter to be the same as all status.
export default class JobFilter extends Component<IProps> {

  public render() {
    const { status } = this.props;
    const radios = allStatus.map((value, i) => (
      <Radio
        key={i}
        label={value}
        checked={!status || status.indexOf(value) >= 0}
        onClick={this.handleToggle.bind(this, value)}
      />
    ));

    return <div className="JobFilter">{radios}</div>;
  }

  private handleToggle(value: string) {
    const status = this.props.status ?
      this.props.status.slice() : allStatus.slice();
    const index = status.indexOf(value);

    if (index >= 0) {
      status.splice(index, 1);
    } else {
      status.push(value);
    }

    this.props.onChange({ ...this.props, status });
  }

}

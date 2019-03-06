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

import "./LogEntryLevelFilter.css";

export interface IProps {
  level: string[] | undefined;
  onChange: (values: IProps) => any;
}

export const allLevel = ["DEBUG", "INFO", "WARNING", "ERROR"];

// Note: we consider undefined level to be the same as all level.
export default class LogEntryLevelFilter extends Component<IProps> {
  public render() {
    const { level } = this.props;
    const radios = allLevel.map((value, i) => (
      <Radio
        key={i}
        label={value}
        checked={!level || level.indexOf(value) >= 0}
        onClick={this.handleToggle.bind(this, value)}
      />
    ));

    return <div className="LogEntryLevelFilter">{radios}</div>;
  }

  private handleToggle(value: string) {
    const level = this.props.level
      ? this.props.level.slice()
      : allLevel.slice();
    const index = level.indexOf(value);

    if (index >= 0) {
      level.splice(index, 1);
    } else {
      level.push(value);
    }

    this.props.onChange({ ...this.props, level });
  }
}

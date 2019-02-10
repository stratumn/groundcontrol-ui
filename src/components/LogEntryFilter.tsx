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

import graphql from "babel-plugin-relay/macro";
import React from "react";
import { createFragmentContainer } from "react-relay";

import { LogEntryFilter_projects } from "./__generated__/LogEntryFilter_projects.graphql";

import LogEntryLevelFilter, { IProps as LogEntryLevelFilterProps } from "./LogEntryLevelFilter";
import LogEntryOwnerFilter, { IProps as LogEntryOwnerFilterProps } from "./LogEntryOwnerFilter";

export interface IProps {
  level?: string[];
  projects: LogEntryFilter_projects;
  ownerId?: string;
  onChange: (value: IProps) => any;
}

export function LogEntryFilter(props: IProps) {
  const { level, projects, ownerId, onChange } = props;
  const handleOwnerChange = (values: LogEntryOwnerFilterProps) => {
    onChange({ ...props, ownerId: values.ownerId });
  };
  const handleLevelChange = (values: LogEntryLevelFilterProps) => {
    onChange({ ...props, level: values.level });
  };

  return (
    <div className="LogEntryFilter">
      <LogEntryOwnerFilter
        items={projects}
        ownerId={ownerId}
        onChange={handleOwnerChange}
      />
      <LogEntryLevelFilter
        level={level}
        onChange={handleLevelChange}
      />
    </div>
  );
}

export default createFragmentContainer(LogEntryFilter, graphql`
  fragment LogEntryFilter_projects on Project @relay(plural: true) {
    ...LogEntryOwnerFilter_items
  }`,
);

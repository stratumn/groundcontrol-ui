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

import LogEntryOwnerFilter, { IProps as LogEntryOwnerFilterProps } from "./LogEntryOwnerFilter";
import LogEntryStatusFilter, { IProps as LogEntryStatusFilterProps } from "./LogEntryStatusFilter";

export interface IProps {
  status?: string[];
  projects: LogEntryFilter_projects;
  ownerId?: string;
  onChange: (value: IProps) => any;
}

export function LogEntryFilter(props: IProps) {
  const { status, projects, ownerId, onChange } = props;
  const handleOwnerChange = ({ ownerId }: LogEntryOwnerFilterProps) => {
    onChange({ ...props, ownerId });
  }
  const handleStatusChange = ({ status }: LogEntryStatusFilterProps) => {
    onChange({ ...props, status });
  }

  return (
    <div className="LogEntryFilter">
      <LogEntryOwnerFilter
        items={projects}
        ownerId={ownerId}
        onChange={handleOwnerChange}
      />
      <LogEntryStatusFilter
        status={status}
        onChange={handleStatusChange}
      />
    </div>
  );
}

export default createFragmentContainer(LogEntryFilter, graphql`
  fragment LogEntryFilter_projects on Project @relay(plural: true) {
    ...LogEntryOwnerFilter_items
  }`,
);

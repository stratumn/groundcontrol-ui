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

import React, { Fragment } from "react";

export interface IProps {
  repository: string;
}

export default function({ repository }: IProps) {
  let parts = repository.split("/");
  parts = parts.splice(Math.max(parts.length - 2, 0));
  parts[0] = parts[0].replace(/^.*:/, "");
  const len = parts.length;
  parts[len - 1] = parts[len - 1].replace(/\.git$/, "");
  const shortName = parts.join("/");

  return <Fragment>{shortName}</Fragment>;
}

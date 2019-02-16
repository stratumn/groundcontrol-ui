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

export class Router {
  public addTransitionHook = jest.fn(() => jest.fn());
  public createHref = jest.fn();
  public createLocation = jest.fn();
  public go = jest.fn();
  public isActive = jest.fn();
  public matcher = {
    format: jest.fn(),
    getRoutes: jest.fn(),
    isActive: jest.fn(),
    match: jest.fn(),
  };
  public push = jest.fn();
  public replace = jest.fn();
}

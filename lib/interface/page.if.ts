
export interface PageOptions {
  package: `@${string}/${string}` | URL;
  options: PageConfigurationOptions;
}

export interface PageConfigurationOptions {
  struct: boolean;
}

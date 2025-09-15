// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "kyzat",
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: ["production"].includes(input?.stage),
      home: "aws",
      providers: {
        aws: {
          region: "ap-south-1",
          profile: "default",
        },
      },
    };
  },
  async run() {
    const site = new sst.aws.Nextjs("kyzat");
    
    $output({
      websiteUrl: site.url,
    })
  },
});

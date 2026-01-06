## Step by Step Tutorial

This is a full step-by-step (hopefully) fool proof explanation on how to add your own server mapping without any prior knowledge.

#### 0. What is this exactly?

This repository provides server mappings for the NoRisk Client, allowing servers to have enhanced icons, banners, and metadata displayed in the client. This happens by supplying a manifest in JSON format. You can find an example on how this JSON can look like [here](https://github.com/NoRiskClient/nrc-server-mappings/blob/main/servers/hypixel/manifest.json).

#### 1. Fork the Repository

To make any changes, like adding your own server, you need to 'fork' the repository. This means you create a copy, because you are not allowed to make direct changes to our version. Instead you make them in your own 'clone' and then 'ask' (aka Pull Request or PR) your changes to be merged. For this you need an account on GitHub.

![image with a red arrow pointing at 'Fork' text on the noriskclient/nrc-server-mappings github repository](assets/sbs-fork-repo.png)

#### 2. Make your changes

To create your own entry, go to `/servers` in your fork and create a folder named after your server. Then create a `manifest.json` file and fill it like outlined in the [docs](https://github.com/NoRiskClient/nrc-server-mappings/blob/main/docs/manifest.md) for the manifest. Make sure you follow the [conventions](https://github.com/NoRiskClient/nrc-server-mappings/blob/main/docs/conventions.md). Make sure you upload all referenced images and that they follow our guidelines. After you've done all of that it is time to ...

#### 3. Create the Pull Request

When you back to the project / repository root you should see a banner that says something like `This branch is 1 commit ahead of NoRiskClient/nrc-server-mappings:main.`. Click on 'Contribute' and then 'Open pull request':

![](assets/sbs-open-pr-banner.png)

Or alternatively it could also look like this: ![](assets/sbs-open-pr-banner2.png)

Please take your time and fill out the checklist provided in the description. It will ask you whether you read and understood the documentation and whether your manifest meets all our requirements.

Then just click on 'Create pull request':

![](assets/sbs-create-pr.png)

#### 4. Check if there are any errors

Check in your newly created PR, if there are any errors. If there is an ❌, click on it to check whats wrong. We will not merge anything, where the run failed.

![](assets/sbs-run-detail.png)

_Make sure to always check the newest run. Sometimes it will take a short time for the test to run_

#### 5. Wait for a merge

Our team will review your changes. Please understand that this can take a while. If we do not respond within a week, you can join our [discord](http://discord.norisk.gg/) an make a ticket reminding us of the matter.

> Note: Once you have created a PR, it may take us one or two days to review and accept it.

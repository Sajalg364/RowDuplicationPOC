import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { registerLicense } from '@syncfusion/ej2-base';

registerLicense('Ngo9BigBOggjHTQxAR8/V1JFaF1cX2hIf0x0Rnxbf1x1ZFNMYVtbRnFPMyBoS35Rc0RiWHZecHdXQ2NdVU1+VEFc');

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));

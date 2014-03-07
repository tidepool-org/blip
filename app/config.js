/**
 * Copyright (c) 2014, Tidepool Project
 * 
 * This program is free software; you can redistribute it and/or modify it under
 * the terms of the associated License, which is identical to the BSD 2-Clause
 * License as published by the Open Source Initiative at opensource.org.
 * 
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the License for more details.
 * 
 * You should have received a copy of the License along with this program; if
 * not, you can obtain one from Tidepool Project at tidepool.org.
 */

// NOTE: This is a Lodash template

window.config = {
  VERSION: '<%= pkg.version %>' || '',
  IMAGES_ENDPOINT: '<%= process.env.IMAGES_ENDPOINT %>' || 'images',
  MOCK: (function(){
    var mockValue = '<%= process.env.MOCK %>';
    if (mockValue === '') {
      return false;
    } else {
      return mockValue === 'true';
    }
  })(),
  MOCK_PARAMS: '<%= process.env.MOCK_PARAMS %>' || '',
  UPLOAD_API: '<%= process.env.UPLOAD_API %>' || 'https://devel-uploads.tidepool.io',
  API_HOST: '<%= process.env.API_HOST %>' || 'https://devel-api.tidepool.io'
};

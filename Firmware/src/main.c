/*
 * Copyright (c) 2014-2018 Cesanta Software Limited
 * All rights reserved
 *
 * Licensed under the Apache License, Version 2.0 (the ""License"");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an ""AS IS"" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

#include "math.h"
#include "mgos.h"
#include "mgos_utils.h"
#include "mgos_time.h"
#include "mgos_gpio.h"

// #define OPEN    0
#define CLOSED  1

// static mgos_timer_id button_timer_id = MGOS_INVALID_TIMER_ID;
// static int s_button_state = 0;
// static int s_relay_state = CLOSED;

// static int sampling_interval = 300;

/*void button_sampling_handler(void *args) {
    bool state = mgos_gpio_read(mgos_sys_config_get_pinout_button());
    if (state != s_button_state) {
      s_button_state = state;
      mgos_gpio_write(mgos_sys_config_get_pinout_relay(), state);
    }
    (void) args;
}*/

enum mgos_app_init_result mgos_app_init(void) {
  // mgos_gpio_set_mode(mgos_sys_config_get_pinout_button(), MGOS_GPIO_MODE_INPUT);
  mgos_gpio_set_mode(mgos_sys_config_get_pinout_magnetic(), MGOS_GPIO_MODE_INPUT);
  mgos_gpio_set_mode(mgos_sys_config_get_pinout_relay(), MGOS_GPIO_MODE_OUTPUT);
  mgos_gpio_write(mgos_sys_config_get_pinout_relay(), CLOSED);
  // button_timer_id = mgos_set_timer(sampling_interval, MGOS_TIMER_REPEAT, button_sampling_handler, NULL);
  return MGOS_APP_INIT_SUCCESS;
}

# Setups

A setup defines the devices in a network, their module definitions, and configuration settings for the pipeline services.

The pipeline service defaults are set in `services/compose.yaml` - each setup should have a setup.yaml file and any pipeline setting overrides in compose-overrides.yaml.

Subfolders

- common/dashboards - generic dashboard definitions, usable by any client
- common/modules - dataitem definitions - input/output yamls, recordings for playback
- example - an example setup with live microcontroller and mazak cnc stats
- template - a template setup for use with `./l99 init SETUP`
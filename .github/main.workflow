workflow "New workflow" {
  on = "push"
  resolves = ["Lint", "Install"]
}

action "Install" {
  uses = "Borales/actions-yarn@1.1.0"
  args = "install"
}

action "Lint" {
  uses = "Borales/actions-yarn@1.1.0"
  args = "lint"
  needs = ["Install"]
}

import Application from "./widgets/Application/Application";

const args = [imports.system.programInvocationName].concat(ARGV);
new Application().run(args);

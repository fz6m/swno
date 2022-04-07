import 'zx-pro/globals'

const run = async () => {
  await $`echo "123"`
  console.log(chalk.red('red'), globby.globbySync(path.join(__dirname, './s')))
}

run()

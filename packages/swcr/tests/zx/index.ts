import 'zx/globals'

const run = async () => {
  const r = await $`echo "123"`
  console.log(r.stdout)
  console.log(chalk.red('red'), globby.globbySync(path.join(__dirname, './s')))
}

run()

enum ES {
  a = 1,
}

const a = async () => {
  return 2
}

console.log(ES.a)
a().then((r) => {
  console.log(r)
})

<script>
  import KeyedView from "root/views/KeyedView.svelte"
  export let patient;
  
  const capitalize = (s) => {
    if (typeof s !== 'string') return ''
    return s.charAt(0).toUpperCase() + s.slice(1)
  }

  const processNameObject = (obj) => {
    let result = []
    for(let item of obj) {
      try {
        if(item.use === 'official') {
          result = result.concat(item.given)
          result.push(item.family)
        }
      } catch (error) {
        console.error('Error (ignored)', error);        
      }
    }
    return result.join(' ')
    //[{"use":"official","family":"Chalmers","given":["Peter","James"]},{"use":"usual","given":["Jim"]},{"use":"maiden","family":"Windsor","given":["Peter","James"],"period":{"end":"2002"}}]
  }

  let mapping = {
    '*': (k, v) => ({ k: capitalize(k), v: v }),
    'name': (k, v) => ({ k: k, v: processNameObject(v) }),
    'active': (k, v) => ({ k: k, v: v ? 'Yes' : 'No' }),
    'id': 'ID',
    'birthDate': 'Date of Birth'
  }
  let displayKeys = 'id,name,active,gender,birthDate'.split(',')
</script>
<div class="patient-view">
    <KeyedView object={patient} mapping={mapping} displayKeys={displayKeys}></KeyedView>
</div>
<style lang="stylus">
.patient-view
    width 100%
    border-radius 5px
    background: #eeedeb;
</style>
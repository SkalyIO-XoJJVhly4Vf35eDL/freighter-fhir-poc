<script>
export let type = '';
export let callback = null;
</script>
<div on:click="{callback}" class="btn {type}"><slot></slot></div>

<style lang="stylus">
    .btn {
        padding 15px
        font-size 15px
        font-weight bold
        border-radius 15px
        color #fff
        cursor pointer

        &.delete {

            &:hover {
                background: #ed5c51
            }
            &:active {
                background: #d14338
            } 
            background #b92e23
        }
        
        &.primary {

            &:hover {
                background: #3bbeff
            }
            &:active {
                background: #0296df
            }

            background #00a7f9
        }
    }
</style>
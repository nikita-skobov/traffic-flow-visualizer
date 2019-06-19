#!/usr/bin/env bash
# d
function usage()
{
  local just_help=$1
  local missing_required=$2
  local invalid_argument=$3
  local invalid_option=$4

  local help="Usage: test-all.sh [OPTIONS]

[ENTER YOUR DESCRIPTION HERE]

Example: test-all.sh [ENTER YOUR EXAMPLE ARGUMENTS HERE]

Options (* indicates it is required):"
  local help_options="    \ \--web-bucket \<Parameter>\[ENTER YOUR DESCRIPTION HERE]
    \ \--report-bucket \<Parameter>\[ENTER YOUR DESCRIPTION HERE]
"

  if [ "$missing_required" != "" ]
  then
    echo "Missing required argument: $missing_required"
  fi

  if [ "$invalid_option" != "" ] && [ "$invalid_value" = "" ]
  then
    echo "Invalid option: $invalid_option"
  elif [ "$invalid_value" != "" ]
  then
    echo "Invalid value: $invalid_value for option: --$invalid_option"
  fi

  echo -e "
"
  echo "$help"
  echo "$help_options" | column -t -s'\'
  return
}
function init_args()
{
REQ_ARGS=()

# get command line arguments
POSITIONAL=()
while [[ $# -gt 0 ]]
do
key="$1"

case $key in
  --project-name)
    project_name="$2"
    shift 2
    ;;
	--report-bucket)
		report_bucket="$2"
		shift 2
		;;
  --dont-delete)
		dont_delete="$2"
		shift 2
		;;
	*)
		POSITIONAL+=("$1") # saves unknown option in array
		shift
		;;
esac
done

for i in "${REQ_ARGS[@]}"; do
  # $i is the string of the variable name
  # ${!i} is a parameter expression to get the value
  # of the variable whose name is i.
  req_var=${!i}
  if [ "$req_var" = "" ]
  then
    usage "" "--$i"
    exit
  fi
done
}
init_args $@



latest_json="$(aws s3api head-object --bucket $report_bucket --key reports/$project_name/latest.json --query Metadata.number 2>&1)"
my_file=$(<latest.json)


if [ "${latest_json:0:1}" == "\"" ]
then
  without_last_quote="${latest_json%\"}"
  without_first_quote="${without_last_quote#\"}"
  report_number=$(($without_first_quote+1))
  
  # set the build_number property in the json file:
  build_number="\"build_number\":\"$report_number\","
  my_final_file="{$build_number${my_file:1}"
  echo "$my_final_file" > latest_temp.json
  
  echo "Moving previous latest.json into: report_$without_first_quote.json"
  aws s3 mv s3://$report_bucket/reports/$project_name/latest.json s3://$report_bucket/reports/$project_name/report_$without_first_quote.json
  echo "Uploading report number: $report_number as latest.json"
  aws s3 cp latest_temp.json s3://$report_bucket/reports/$project_name/latest.json --metadata "number=$report_number" --cache-control "public,max-age=30"
else
  # otherwise that means there is no latest.json file
  # so this is the first one

  # set the build_number property in the json file:
  build_number="\"build_number\":\"1\","
  my_final_file="{$build_number${my_file:1}"
  echo "$my_final_file" > latest_temp.json

  echo "Uploading report number: 1 as latest.json"
  aws s3 cp latest_temp.json s3://$report_bucket/reports/$project_name/latest.json --metadata "number=1" --cache-control "public,max-age=30"
fi

if [ "$dont_delete" != "true" ]
then
  echo "deleting latest.json"
  rm latest.json
fi

rm latest_temp.json

exit 0
